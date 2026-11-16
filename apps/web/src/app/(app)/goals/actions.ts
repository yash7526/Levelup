"use server";

import {
  addMilestone,
  createGoal,
  deleteGoal,
  deleteMilestone,
  setGoalStatus,
  setMilestoneDone,
  updateGoal,
} from "@levelup/supabase";
import type { GoalStatus } from "@levelup/types";
import {
  parseGoalTitle,
  parseLifeArea,
  parseMilestoneTitle,
  parseTargetDate,
} from "@levelup/utils";
import { revalidatePath } from "next/cache";

import {
  type ActionResult,
  describeActionError,
  isId,
  SESSION_EXPIRED,
} from "@/lib/growth/action-result";
import { getGrowthContext } from "@/lib/growth/context";

function refreshPlanningPages() {
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export type SaveGoalResult =
  | { ok: true }
  | {
      ok: false;
      error?: string;
      fieldErrors?: { title?: string; area?: string; targetDate?: string };
    };

/** Creates a goal, or updates one when the form carries an `id`. */
export async function saveGoal(formData: FormData): Promise<SaveGoalResult> {
  const id = formData.get("id");
  if (id !== null && id !== "" && !isId(id)) return { ok: false, error: "Invalid request." };

  const title = parseGoalTitle(formData.get("title"));
  const area = parseLifeArea(formData.get("area"));
  const targetDate = parseTargetDate(formData.get("targetDate"));
  if (!title.ok || !area.ok || !targetDate.ok) {
    return {
      ok: false,
      fieldErrors: {
        title: title.ok ? undefined : title.error,
        area: area.ok ? undefined : area.error,
        targetDate: targetDate.ok ? undefined : targetDate.error,
      },
    };
  }

  const context = await getGrowthContext();
  if (!context) return { ok: false, error: SESSION_EXPIRED };

  const input = { title: title.value, area: area.value, targetDate: targetDate.value };
  try {
    if (isId(id)) await updateGoal(context.supabase, id, input);
    else await createGoal(context.supabase, input);
  } catch (error) {
    console.error("[goals] Failed to save goal", error);
    return {
      ok: false,
      error: describeActionError(error, "We couldn't save that goal. Please try again."),
    };
  }
  refreshPlanningPages();
  return { ok: true };
}

const STATUSES: readonly GoalStatus[] = ["active", "paused", "completed"];

export async function changeGoalStatus(id: string, status: GoalStatus): Promise<ActionResult> {
  if (!isId(id) || !STATUSES.includes(status)) return { ok: false, error: "Invalid request." };
  return run(
    (supabase) => setGoalStatus(supabase, id, status),
    "We couldn't update that goal. Please try again.",
  );
}

export async function removeGoal(id: string): Promise<ActionResult> {
  if (!isId(id)) return { ok: false, error: "Invalid request." };
  return run(
    (supabase) => deleteGoal(supabase, id),
    "We couldn't delete that goal. Please try again.",
  );
}

export async function createMilestone(goalId: string, title: string): Promise<ActionResult> {
  if (!isId(goalId)) return { ok: false, error: "Invalid request." };
  const parsed = parseMilestoneTitle(title);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  return run(
    (supabase) => addMilestone(supabase, goalId, parsed.value),
    "We couldn't add that milestone. Please try again.",
  );
}

export async function setMilestoneComplete(id: string, done: boolean): Promise<ActionResult> {
  if (!isId(id) || typeof done !== "boolean") return { ok: false, error: "Invalid request." };
  return run(
    (supabase) => setMilestoneDone(supabase, id, done),
    "We couldn't update that milestone. Please try again.",
  );
}

export async function removeMilestone(id: string): Promise<ActionResult> {
  if (!isId(id)) return { ok: false, error: "Invalid request." };
  return run(
    (supabase) => deleteMilestone(supabase, id),
    "We couldn't remove that milestone. Please try again.",
  );
}

async function run(
  action: (
    supabase: NonNullable<Awaited<ReturnType<typeof getGrowthContext>>>["supabase"],
  ) => Promise<unknown>,
  fallback: string,
): Promise<ActionResult> {
  const context = await getGrowthContext();
  if (!context) return { ok: false, error: SESSION_EXPIRED };
  try {
    await action(context.supabase);
  } catch (error) {
    console.error("[goals] Action failed", error);
    return { ok: false, error: describeActionError(error, fallback) };
  }
  refreshPlanningPages();
  return { ok: true };
}

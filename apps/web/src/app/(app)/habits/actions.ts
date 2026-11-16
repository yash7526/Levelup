"use server";

import { createHabit, setHabitArchived, setHabitCheckin, updateHabit } from "@levelup/supabase";
import {
  addDays,
  HABIT_HISTORY_DAYS,
  type HabitDraftErrors,
  isISODate,
  parseHabitDraft,
} from "@levelup/utils";
import { revalidatePath } from "next/cache";

import {
  type ActionResult,
  describeActionError,
  isId,
  SESSION_EXPIRED,
} from "@/lib/growth/action-result";
import { getGrowthContext } from "@/lib/growth/context";

function refreshGrowthPages() {
  revalidatePath("/habits");
  revalidatePath("/today");
  revalidatePath("/dashboard");
}

export type SaveHabitResult =
  { ok: true } | { ok: false; error?: string; fieldErrors?: HabitDraftErrors };

/** Creates a habit, or updates one when the form carries an `id`. */
export async function saveHabit(formData: FormData): Promise<SaveHabitResult> {
  const id = formData.get("id");
  if (id !== null && id !== "" && !isId(id)) return { ok: false, error: "Invalid request." };

  const draft = parseHabitDraft({
    name: formData.get("name"),
    area: formData.get("area"),
    schedule: {
      type: formData.get("scheduleType"),
      days: formData.getAll("days"),
      timesPerWeek: formData.get("timesPerWeek"),
    },
  });
  if (!draft.ok) return { ok: false, fieldErrors: draft.error };

  const context = await getGrowthContext();
  if (!context) return { ok: false, error: SESSION_EXPIRED };

  try {
    if (isId(id)) await updateHabit(context.supabase, id, draft.value);
    else await createHabit(context.supabase, draft.value);
  } catch (error) {
    console.error("[habits] Failed to save habit", error);
    return {
      ok: false,
      error: describeActionError(error, "We couldn't save that habit. Please try again."),
    };
  }

  refreshGrowthPages();
  return { ok: true };
}

/** Marks a habit done or not done on one of the last seven days. */
export async function setCheckin(
  habitId: string,
  day: string,
  done: boolean,
): Promise<ActionResult> {
  if (!isId(habitId) || !isISODate(day) || typeof done !== "boolean") {
    return { ok: false, error: "Invalid request." };
  }
  const context = await getGrowthContext();
  if (!context) return { ok: false, error: SESSION_EXPIRED };
  if (day > context.today || day < addDays(context.today, 1 - HABIT_HISTORY_DAYS)) {
    return { ok: false, error: "You can only change the last seven days." };
  }

  try {
    await setHabitCheckin(context.supabase, habitId, day, done);
  } catch (error) {
    console.error("[habits] Failed to update check-in", error);
    return {
      ok: false,
      error: describeActionError(error, "We couldn't save that check-in. Please try again."),
    };
  }
  refreshGrowthPages();
  return { ok: true };
}

async function setArchived(id: string, archived: boolean): Promise<ActionResult> {
  if (!isId(id)) return { ok: false, error: "Invalid request." };
  const context = await getGrowthContext();
  if (!context) return { ok: false, error: SESSION_EXPIRED };
  try {
    await setHabitArchived(context.supabase, id, archived);
  } catch (error) {
    console.error("[habits] Failed to change archive state", error);
    return {
      ok: false,
      error: describeActionError(
        error,
        archived
          ? "We couldn't archive that habit. Please try again."
          : "We couldn't restore that habit. Please try again.",
      ),
    };
  }
  refreshGrowthPages();
  return { ok: true };
}

export async function archiveHabit(id: string): Promise<ActionResult> {
  return setArchived(id, true);
}

export async function restoreHabit(id: string): Promise<ActionResult> {
  return setArchived(id, false);
}

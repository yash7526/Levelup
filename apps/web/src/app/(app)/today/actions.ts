"use server";

import {
  createPriority,
  deletePriority,
  movePriorityToDay,
  setPriorityStatus,
} from "@levelup/supabase";
import { parseLifeArea, parsePriorityTitle } from "@levelup/utils";
import { revalidatePath } from "next/cache";

import {
  type ActionResult,
  describeActionError,
  isId,
  SESSION_EXPIRED,
} from "@/lib/growth/action-result";
import { getGrowthContext } from "@/lib/growth/context";

function refreshGrowthPages() {
  revalidatePath("/today");
  revalidatePath("/dashboard");
}

export interface AddPriorityState {
  status: "idle" | "added" | "error";
  error?: string;
  fieldErrors?: { title?: string; area?: string };
  /** Echo of the submitted values so the form keeps what was typed on error. */
  values?: { title: string; area: string };
  /** Changes on every success so the form can reset itself. */
  nonce?: number;
}

/** Adds a priority to the viewer's today, in the first free slot. */
export async function addPriority(
  _previous: AddPriorityState,
  formData: FormData,
): Promise<AddPriorityState> {
  const rawTitle = formData.get("title");
  const rawArea = formData.get("area");
  const values = {
    title: typeof rawTitle === "string" ? rawTitle : "",
    area: typeof rawArea === "string" ? rawArea : "",
  };
  const title = parsePriorityTitle(rawTitle);
  const area = parseLifeArea(rawArea);
  if (!title.ok || !area.ok) {
    return {
      status: "error",
      values,
      fieldErrors: {
        title: title.ok ? undefined : title.error,
        area: area.ok ? undefined : area.error,
      },
    };
  }

  const context = await getGrowthContext();
  if (!context) return { status: "error", error: SESSION_EXPIRED, values };

  try {
    await createPriority(context.supabase, {
      day: context.today,
      title: title.value,
      area: area.value,
    });
  } catch (error) {
    console.error("[today] Failed to add priority", error);
    return {
      status: "error",
      values,
      error: describeActionError(error, "We couldn't add that priority. Please try again."),
    };
  }

  refreshGrowthPages();
  return { status: "added", nonce: Date.now() };
}

export async function setPriorityDone(id: string, done: boolean): Promise<ActionResult> {
  if (!isId(id) || typeof done !== "boolean") return { ok: false, error: "Invalid request." };
  const context = await getGrowthContext();
  if (!context) return { ok: false, error: SESSION_EXPIRED };
  try {
    await setPriorityStatus(context.supabase, id, done ? "done" : "open");
  } catch (error) {
    console.error("[today] Failed to update priority", error);
    return {
      ok: false,
      error: describeActionError(error, "We couldn't update that priority. Please try again."),
    };
  }
  refreshGrowthPages();
  return { ok: true };
}

export async function removePriority(id: string): Promise<ActionResult> {
  if (!isId(id)) return { ok: false, error: "Invalid request." };
  const context = await getGrowthContext();
  if (!context) return { ok: false, error: SESSION_EXPIRED };
  try {
    await deletePriority(context.supabase, id);
  } catch (error) {
    console.error("[today] Failed to remove priority", error);
    return {
      ok: false,
      error: describeActionError(error, "We couldn't remove that priority. Please try again."),
    };
  }
  refreshGrowthPages();
  return { ok: true };
}

/** Moves an unfinished priority from an earlier day onto today. */
export async function moveToToday(id: string): Promise<ActionResult> {
  if (!isId(id)) return { ok: false, error: "Invalid request." };
  const context = await getGrowthContext();
  if (!context) return { ok: false, error: SESSION_EXPIRED };
  try {
    await movePriorityToDay(context.supabase, id, context.today);
  } catch (error) {
    console.error("[today] Failed to move priority", error);
    return {
      ok: false,
      error: describeActionError(error, "We couldn't move that priority. Please try again."),
    };
  }
  refreshGrowthPages();
  return { ok: true };
}

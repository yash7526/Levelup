"use server";

import {
  createLearningItem,
  deleteLearningSession,
  logLearningSession,
  setLearningArchived,
  setLearningProgress,
  updateLearningItem,
} from "@levelup/supabase";
import type { LearningItem, LearningKind, LearningUnit } from "@levelup/types";
import {
  LEARNING_TOTAL_MAX,
  parseLearningTitle,
  parseSessionNote,
  parseWholeNumber,
  SESSION_MINUTES_MAX,
} from "@levelup/utils";
import { revalidatePath } from "next/cache";

import {
  type ActionResult,
  describeActionError,
  isId,
  SESSION_EXPIRED,
} from "@/lib/growth/action-result";
import { getGrowthContext } from "@/lib/growth/context";

const KINDS: readonly LearningKind[] = ["course", "book", "skill", "article"];
const UNITS: readonly LearningUnit[] = ["lessons", "chapters", "pages", "modules"];

function refreshPlanningPages() {
  revalidatePath("/learning");
  revalidatePath("/dashboard");
}

type Supabase = NonNullable<Awaited<ReturnType<typeof getGrowthContext>>>["supabase"];

async function run(
  action: (supabase: Supabase, today: string) => Promise<unknown>,
  fallback: string,
): Promise<ActionResult> {
  const context = await getGrowthContext();
  if (!context) return { ok: false, error: SESSION_EXPIRED };
  try {
    await action(context.supabase, context.today);
  } catch (error) {
    console.error("[learning] Action failed", error);
    return { ok: false, error: describeActionError(error, fallback) };
  }
  refreshPlanningPages();
  return { ok: true };
}

export type SaveItemResult =
  | { ok: true }
  | {
      ok: false;
      error?: string;
      fieldErrors?: { title?: string; kind?: string; unit?: string; total?: string };
    };

/** Adds an item, or edits one when the form carries an `id` (and the current `completed`). */
export async function saveLearningItem(formData: FormData): Promise<SaveItemResult> {
  const id = formData.get("id");
  if (id !== null && id !== "" && !isId(id)) return { ok: false, error: "Invalid request." };

  const title = parseLearningTitle(formData.get("title"));
  const kind = formData.get("kind");
  const unit = formData.get("unit");
  const total = parseWholeNumber(formData.get("total"), 1, LEARNING_TOTAL_MAX, "The total");
  const kindOk = KINDS.find((value) => value === kind);
  const unitOk = UNITS.find((value) => value === unit);
  if (!title.ok || !total.ok || !kindOk || !unitOk) {
    return {
      ok: false,
      fieldErrors: {
        title: title.ok ? undefined : title.error,
        kind: kindOk ? undefined : "Choose a type.",
        unit: unitOk ? undefined : "Choose a unit.",
        total: total.ok ? undefined : total.error,
      },
    };
  }

  const input = { title: title.value, kind: kindOk, unit: unitOk, total: total.value };
  const completedRaw = parseWholeNumber(
    formData.get("completed"),
    0,
    LEARNING_TOTAL_MAX,
    "Progress",
  );
  const result = await run(async (supabase) => {
    if (isId(id)) {
      await updateLearningItem(supabase, id, input, completedRaw.ok ? completedRaw.value : 0);
    } else {
      await createLearningItem(supabase, input);
    }
  }, "We couldn't save that. Please try again.");
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function setItemProgress(
  item: Pick<LearningItem, "id" | "total">,
  completed: number,
): Promise<ActionResult> {
  if (!isId(item.id)) return { ok: false, error: "Invalid request." };
  const parsed = parseWholeNumber(completed, 0, item.total, "Progress");
  if (!parsed.ok) return { ok: false, error: parsed.error };
  return run(
    (supabase) => setLearningProgress(supabase, item.id, parsed.value),
    "We couldn't save your progress. Please try again.",
  );
}

export async function archiveLearningItem(id: string, archived: boolean): Promise<ActionResult> {
  if (!isId(id)) return { ok: false, error: "Invalid request." };
  return run(
    (supabase) => setLearningArchived(supabase, id, archived),
    "We couldn't update that item. Please try again.",
  );
}

export type LogSessionResult =
  { ok: true } | { ok: false; error?: string; fieldErrors?: { minutes?: string; note?: string } };

/** Logs a study session against an item, dated today in the viewer's time zone. */
export async function logSession(formData: FormData): Promise<LogSessionResult> {
  const itemId = formData.get("itemId");
  if (!isId(itemId)) return { ok: false, error: "Invalid request." };

  const minutes = parseWholeNumber(formData.get("minutes"), 1, SESSION_MINUTES_MAX, "Minutes");
  const note = parseSessionNote(formData.get("note"));
  if (!minutes.ok || !note.ok) {
    return {
      ok: false,
      fieldErrors: {
        minutes: minutes.ok ? undefined : minutes.error,
        note: note.ok ? undefined : note.error,
      },
    };
  }

  const result = await run(
    (supabase, today) =>
      logLearningSession(supabase, {
        itemId,
        day: today,
        minutes: minutes.value,
        note: note.value,
      }),
    "We couldn't log that session. Please try again.",
  );
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function removeSession(id: string): Promise<ActionResult> {
  if (!isId(id)) return { ok: false, error: "Invalid request." };
  return run(
    (supabase) => deleteLearningSession(supabase, id),
    "We couldn't remove that session. Please try again.",
  );
}

import type {
  ISODateString,
  LearningItem,
  LearningKind,
  LearningSession,
  LearningUnit,
} from "@levelup/types";

import type { LevelUpSupabaseClient } from "./client";
import type { Tables } from "./database.types";
import { LevelUpDataError, throwQueryError } from "./errors";

const ITEM_COLUMNS = "id, title, kind, unit, total, completed, created_at, archived_at";
const SESSION_COLUMNS = "id, item_id, day, minutes, note";

export type LearningItemRow = Pick<
  Tables<"learning_items">,
  "id" | "title" | "kind" | "unit" | "total" | "completed" | "created_at" | "archived_at"
>;
export type LearningSessionRow = Pick<
  Tables<"learning_sessions">,
  "id" | "item_id" | "day" | "minutes" | "note"
>;

/** How many recent sessions are loaded. */
export const SESSION_HISTORY_LIMIT = 200;

const kinds: readonly LearningKind[] = ["course", "book", "skill", "article"];
const units: readonly LearningUnit[] = ["lessons", "chapters", "pages", "modules"];

export function mapLearningItemRow(row: LearningItemRow): LearningItem {
  return {
    id: row.id,
    title: row.title,
    kind: kinds.find((kind) => kind === row.kind) ?? "course",
    unit: units.find((unit) => unit === row.unit) ?? "lessons",
    total: row.total,
    completed: Math.min(Math.max(row.completed, 0), row.total),
    createdAt: row.created_at,
    archivedAt: row.archived_at,
  };
}

export function mapLearningSessionRow(row: LearningSessionRow): LearningSession {
  return {
    id: row.id,
    itemId: row.item_id,
    day: row.day,
    minutes: row.minutes,
    note: row.note,
  };
}

/** Every learning item, active and archived, oldest first. */
export async function listLearningItems(client: LevelUpSupabaseClient): Promise<LearningItem[]> {
  const { data, error } = await client
    .from("learning_items")
    .select(ITEM_COLUMNS)
    .order("created_at")
    .order("id");
  if (error) throwQueryError("load your learning library", error);
  return data.map(mapLearningItemRow);
}

/** The most recent sessions across all items, newest first. */
export async function listLearningSessions(
  client: LevelUpSupabaseClient,
): Promise<LearningSession[]> {
  const { data, error } = await client
    .from("learning_sessions")
    .select(SESSION_COLUMNS)
    .order("day", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(SESSION_HISTORY_LIMIT);
  if (error) throwQueryError("load learning sessions", error);
  return data.map(mapLearningSessionRow);
}

export interface LearningItemInput {
  title: string;
  kind: LearningKind;
  unit: LearningUnit;
  total: number;
}

export async function createLearningItem(
  client: LevelUpSupabaseClient,
  input: LearningItemInput,
): Promise<LearningItem> {
  const { data, error } = await client
    .from("learning_items")
    .insert(input)
    .select(ITEM_COLUMNS)
    .single();
  if (error) throwQueryError("add to your library", error);
  return mapLearningItemRow(data);
}

/**
 * Edits an item. Lowering the total below what is done pulls `completed` down with
 * it, because the database requires `completed <= total`.
 */
export async function updateLearningItem(
  client: LevelUpSupabaseClient,
  id: string,
  { title, kind, unit, total }: LearningItemInput,
  completed: number,
): Promise<void> {
  const { data, error } = await client
    .from("learning_items")
    .update({ title, kind, unit, total, completed: Math.min(completed, total) })
    .eq("id", id)
    .select("id");
  if (error) throwQueryError("update the item", error);
  if (data.length === 0) throw new LevelUpDataError("not_found", "That item no longer exists.");
}

/** Sets how many units are done (0…total). */
export async function setLearningProgress(
  client: LevelUpSupabaseClient,
  id: string,
  completed: number,
): Promise<void> {
  const { data, error } = await client
    .from("learning_items")
    .update({ completed })
    .eq("id", id)
    .select("id");
  if (error) throwQueryError("save your progress", error);
  if (data.length === 0) throw new LevelUpDataError("not_found", "That item no longer exists.");
}

export async function setLearningArchived(
  client: LevelUpSupabaseClient,
  id: string,
  archived: boolean,
): Promise<void> {
  const { data, error } = await client
    .from("learning_items")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq("id", id)
    .select("id");
  if (error) throwQueryError(archived ? "archive the item" : "restore the item", error);
  if (data.length === 0) throw new LevelUpDataError("not_found", "That item no longer exists.");
}

export interface SessionInput {
  itemId: string;
  day: ISODateString;
  minutes: number;
  note: string | null;
}

export async function logLearningSession(
  client: LevelUpSupabaseClient,
  { itemId, day, minutes, note }: SessionInput,
): Promise<LearningSession> {
  const { data, error } = await client
    .from("learning_sessions")
    .insert({ item_id: itemId, day, minutes, note })
    .select(SESSION_COLUMNS)
    .single();
  if (error) throwQueryError("log the session", error);
  return mapLearningSessionRow(data);
}

export async function deleteLearningSession(
  client: LevelUpSupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await client.from("learning_sessions").delete().eq("id", id);
  if (error) throwQueryError("remove the session", error);
}

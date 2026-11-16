import type { ISODateString, LifeArea, PriorityEntry, PriorityStatus } from "@levelup/types";
import { addDays, firstFreePosition, isLifeArea, MAX_PRIORITIES_PER_DAY } from "@levelup/utils";

import type { LevelUpSupabaseClient } from "./client";
import type { Tables } from "./database.types";
import { LevelUpDataError, PG_UNIQUE_VIOLATION, throwQueryError } from "./errors";

const COLUMNS = "id, day, position, title, area, status, completed_at";

export type PriorityRow = Pick<
  Tables<"priorities">,
  "id" | "day" | "position" | "title" | "area" | "status" | "completed_at"
>;

/** How far back unfinished priorities are offered for carrying over. */
export const CARRY_OVER_DAYS = 14;
const CARRY_OVER_LIMIT = 20;

export function mapPriorityRow(row: PriorityRow): PriorityEntry {
  return {
    id: row.id,
    day: row.day,
    position: row.position,
    title: row.title,
    area: isLifeArea(row.area) ? row.area : null,
    status: row.status === "done" ? "done" : "open",
    completedAt: row.completed_at,
  };
}

/** Priorities for the days `from`…`to` (inclusive), by day then slot. */
export async function listPriorities(
  client: LevelUpSupabaseClient,
  from: ISODateString,
  to: ISODateString,
): Promise<PriorityEntry[]> {
  const { data, error } = await client
    .from("priorities")
    .select(COLUMNS)
    .gte("day", from)
    .lte("day", to)
    .order("day")
    .order("position");
  if (error) throwQueryError("load priorities", error);
  return data.map(mapPriorityRow);
}

/** Unfinished priorities from the recent days before `today`, newest first. */
export async function listCarryOverPriorities(
  client: LevelUpSupabaseClient,
  today: ISODateString,
): Promise<PriorityEntry[]> {
  const { data, error } = await client
    .from("priorities")
    .select(COLUMNS)
    .eq("status", "open")
    .lt("day", today)
    .gte("day", addDays(today, -CARRY_OVER_DAYS))
    .order("day", { ascending: false })
    .order("position")
    .limit(CARRY_OVER_LIMIT);
  if (error) throwQueryError("load unfinished priorities", error);
  return data.map(mapPriorityRow);
}

async function freePosition(client: LevelUpSupabaseClient, day: ISODateString): Promise<number> {
  const { data, error } = await client.from("priorities").select("position").eq("day", day);
  if (error) throwQueryError("check today's priorities", error);
  const position = firstFreePosition(data.map((row) => row.position));
  if (position === null) {
    throw new LevelUpDataError(
      "limit_reached",
      `You already have ${MAX_PRIORITIES_PER_DAY} priorities for this day.`,
    );
  }
  return position;
}

/**
 * Runs a write that claims a free slot on `day`. The database's unique (user, day, slot)
 * constraint rejects a slot taken by a concurrent write; one retry picks the next slot.
 */
async function withFreeSlot(
  client: LevelUpSupabaseClient,
  day: ISODateString,
  write: (position: number) => PromiseLike<{
    data: PriorityRow | null;
    error: { message: string; code?: string } | null;
  }>,
  action: string,
): Promise<PriorityEntry> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { data, error } = await write(await freePosition(client, day));
    if (error?.code === PG_UNIQUE_VIOLATION) continue;
    if (error) throwQueryError(action, error);
    if (!data) throw new LevelUpDataError("not_found", "That priority no longer exists.");
    return mapPriorityRow(data);
  }
  throw new LevelUpDataError("conflict", "Your priorities changed elsewhere. Please try again.");
}

export interface NewPriority {
  day: ISODateString;
  title: string;
  area: LifeArea | null;
}

/** Adds a priority in the day's first free slot; `limit_reached` when the day is full. */
export function createPriority(
  client: LevelUpSupabaseClient,
  { day, title, area }: NewPriority,
): Promise<PriorityEntry> {
  return withFreeSlot(
    client,
    day,
    (position) =>
      client.from("priorities").insert({ day, position, title, area }).select(COLUMNS).single(),
    "add the priority",
  );
}

/** Moves a priority (typically an unfinished one) to `day`, into its first free slot. */
export function movePriorityToDay(
  client: LevelUpSupabaseClient,
  id: string,
  day: ISODateString,
): Promise<PriorityEntry> {
  return withFreeSlot(
    client,
    day,
    (position) =>
      client
        .from("priorities")
        .update({ day, position })
        .eq("id", id)
        .select(COLUMNS)
        .maybeSingle(),
    "move the priority",
  );
}

export async function setPriorityStatus(
  client: LevelUpSupabaseClient,
  id: string,
  status: PriorityStatus,
): Promise<PriorityEntry> {
  const { data, error } = await client
    .from("priorities")
    .update({ status, completed_at: status === "done" ? new Date().toISOString() : null })
    .eq("id", id)
    .select(COLUMNS)
    .maybeSingle();
  if (error) throwQueryError("update the priority", error);
  if (!data) throw new LevelUpDataError("not_found", "That priority no longer exists.");
  return mapPriorityRow(data);
}

export async function deletePriority(client: LevelUpSupabaseClient, id: string): Promise<void> {
  const { error } = await client.from("priorities").delete().eq("id", id);
  if (error) throwQueryError("remove the priority", error);
}

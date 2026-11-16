import type {
  Habit,
  HabitCheckin,
  HabitSchedule,
  ISODateString,
  LifeArea,
  Weekday,
} from "@levelup/types";
import { isLifeArea, isWeekday } from "@levelup/utils";

import type { LevelUpSupabaseClient } from "./client";
import type { Tables, TablesInsert, TablesUpdate } from "./database.types";
import { LevelUpDataError, throwQueryError } from "./errors";

const COLUMNS =
  "id, name, area, schedule_type, schedule_days, weekly_target, created_at, archived_at";

export type HabitRow = Pick<
  Tables<"habits">,
  | "id"
  | "name"
  | "area"
  | "schedule_type"
  | "schedule_days"
  | "weekly_target"
  | "created_at"
  | "archived_at"
>;

/** Reads the schedule columns; anything malformed falls back to "every day". */
function mapSchedule(row: HabitRow): HabitSchedule {
  if (row.schedule_type === "weekdays") {
    const days = (row.schedule_days ?? []).filter(isWeekday);
    if (days.length > 0)
      return { type: "weekdays", days: [...new Set<Weekday>(days)].sort((a, b) => a - b) };
  }
  if (row.schedule_type === "weekly" && row.weekly_target) {
    return { type: "weekly", timesPerWeek: row.weekly_target };
  }
  return { type: "daily" };
}

export function mapHabitRow(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    area: isLifeArea(row.area) ? row.area : null,
    schedule: mapSchedule(row),
    createdAt: row.created_at,
    archivedAt: row.archived_at,
  };
}

function scheduleColumns(
  schedule: HabitSchedule,
): Pick<TablesInsert<"habits">, "schedule_type" | "schedule_days" | "weekly_target"> {
  switch (schedule.type) {
    case "daily":
      return { schedule_type: "daily", schedule_days: null, weekly_target: null };
    case "weekdays":
      return { schedule_type: "weekdays", schedule_days: [...schedule.days], weekly_target: null };
    case "weekly":
      return { schedule_type: "weekly", schedule_days: null, weekly_target: schedule.timesPerWeek };
  }
}

/** Every habit, active and archived, oldest first. */
export async function listHabits(client: LevelUpSupabaseClient): Promise<Habit[]> {
  const { data, error } = await client
    .from("habits")
    .select(COLUMNS)
    .order("created_at")
    .order("id");
  if (error) throwQueryError("load habits", error);
  return data.map(mapHabitRow);
}

export interface HabitInput {
  name: string;
  area: LifeArea | null;
  schedule: HabitSchedule;
}

export async function createHabit(
  client: LevelUpSupabaseClient,
  { name, area, schedule }: HabitInput,
): Promise<Habit> {
  const { data, error } = await client
    .from("habits")
    .insert({ name, area, ...scheduleColumns(schedule) })
    .select(COLUMNS)
    .single();
  if (error) throwQueryError("create the habit", error);
  return mapHabitRow(data);
}

async function updateHabitRow(
  client: LevelUpSupabaseClient,
  id: string,
  values: TablesUpdate<"habits">,
  action: string,
): Promise<Habit> {
  const { data, error } = await client
    .from("habits")
    .update(values)
    .eq("id", id)
    .select(COLUMNS)
    .maybeSingle();
  if (error) throwQueryError(action, error);
  if (!data) throw new LevelUpDataError("not_found", "That habit no longer exists.");
  return mapHabitRow(data);
}

/** Renames or reschedules a habit. Past check-ins are kept. */
export function updateHabit(
  client: LevelUpSupabaseClient,
  id: string,
  { name, area, schedule }: HabitInput,
): Promise<Habit> {
  return updateHabitRow(
    client,
    id,
    { name, area, ...scheduleColumns(schedule) },
    "update the habit",
  );
}

/** Archiving hides a habit from Today and the dashboard but keeps its history. */
export function setHabitArchived(
  client: LevelUpSupabaseClient,
  id: string,
  archived: boolean,
): Promise<Habit> {
  return updateHabitRow(
    client,
    id,
    { archived_at: archived ? new Date().toISOString() : null },
    archived ? "archive the habit" : "restore the habit",
  );
}

/** PostgREST returns at most 1,000 rows per request on Supabase by default. */
const PAGE_SIZE = 1000;

/** Every check-in from `from` to `to` (inclusive), across all habits. */
export async function listCheckins(
  client: LevelUpSupabaseClient,
  from: ISODateString,
  to: ISODateString,
): Promise<HabitCheckin[]> {
  const checkins: HabitCheckin[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await client
      .from("habit_checkins")
      .select("id, habit_id, day")
      .gte("day", from)
      .lte("day", to)
      .order("day")
      .order("id")
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throwQueryError("load check-ins", error);
    for (const row of data) checkins.push({ id: row.id, habitId: row.habit_id, day: row.day });
    if (data.length < PAGE_SIZE) return checkins;
  }
}

/** Marks a habit done (or not done) on a day. Safe to repeat. */
export async function setHabitCheckin(
  client: LevelUpSupabaseClient,
  habitId: string,
  day: ISODateString,
  done: boolean,
): Promise<void> {
  if (done) {
    const { error } = await client
      .from("habit_checkins")
      .upsert({ habit_id: habitId, day }, { onConflict: "habit_id,day", ignoreDuplicates: true });
    if (error) throwQueryError("check in", error);
  } else {
    const { error } = await client
      .from("habit_checkins")
      .delete()
      .eq("habit_id", habitId)
      .eq("day", day);
    if (error) throwQueryError("undo the check-in", error);
  }
}

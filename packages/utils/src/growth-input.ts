import type { HabitSchedule, LifeArea, Weekday } from "@levelup/types";

import { lifeAreaLabels } from "./copy";
import { WEEKDAYS } from "./habits";
import { normalizeDisplayName } from "./text";

/*
 * Validation for what people type into the Today and Habits forms. Shared by the web
 * server actions and the mobile app so both enforce the same rules as the database.
 */

export const MAX_PRIORITIES_PER_DAY = 3;
export const PRIORITY_TITLE_MAX_LENGTH = 120;
export const HABIT_NAME_MAX_LENGTH = 60;
/** "7 times a week" is the same as every day, so weekly targets stop at 6. */
export const HABIT_WEEKLY_TARGET_MAX = 6;

export type ParseResult<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

function parseText(input: unknown, maxLength: number, emptyMessage: string): ParseResult<string> {
  const raw = typeof input === "string" ? input : "";
  // Count characters after collapsing whitespace, so pasted spacing doesn't count.
  const cleaned = normalizeDisplayName(raw, Number.MAX_SAFE_INTEGER);
  if (!cleaned) return { ok: false, error: emptyMessage };
  if (Array.from(cleaned).length > maxLength) {
    return { ok: false, error: `Keep it to ${maxLength} characters or fewer.` };
  }
  return { ok: true, value: cleaned };
}

export function parsePriorityTitle(input: unknown): ParseResult<string> {
  return parseText(input, PRIORITY_TITLE_MAX_LENGTH, "Write what you want to get done.");
}

export function parseHabitName(input: unknown): ParseResult<string> {
  return parseText(input, HABIT_NAME_MAX_LENGTH, "Give your habit a name.");
}

export function isLifeArea(value: unknown): value is LifeArea {
  return typeof value === "string" && Object.hasOwn(lifeAreaLabels, value);
}

/** An optional life area: empty means none; anything unknown is rejected. */
export function parseLifeArea(input: unknown): ParseResult<LifeArea | null> {
  if (input === null || input === undefined || input === "") return { ok: true, value: null };
  return isLifeArea(input) ? { ok: true, value: input } : { ok: false, error: "Choose an area." };
}

export function isWeekday(value: unknown): value is Weekday {
  return typeof value === "number" && (WEEKDAYS as readonly number[]).includes(value);
}

export interface HabitScheduleInput {
  type: unknown;
  /** ISO weekdays (numbers or numeric strings) for `weekdays` schedules. */
  days?: readonly unknown[];
  /** Target for `weekly` schedules (number or numeric string). */
  timesPerWeek?: unknown;
}

export function parseHabitSchedule(input: HabitScheduleInput): ParseResult<HabitSchedule> {
  switch (input.type) {
    case "daily":
      return { ok: true, value: { type: "daily" } };
    case "weekdays": {
      const days = new Set<Weekday>();
      for (const value of input.days ?? []) {
        const day = typeof value === "string" ? Number(value) : value;
        if (!isWeekday(day)) return { ok: false, error: "Choose days from Monday to Sunday." };
        days.add(day);
      }
      if (days.size === 0) return { ok: false, error: "Choose at least one day." };
      // Every day of the week is simply a daily habit.
      if (days.size === 7) return { ok: true, value: { type: "daily" } };
      return { ok: true, value: { type: "weekdays", days: WEEKDAYS.filter((d) => days.has(d)) } };
    }
    case "weekly": {
      const raw = input.timesPerWeek;
      const times = typeof raw === "string" ? Number(raw) : raw;
      if (
        typeof times !== "number" ||
        !Number.isInteger(times) ||
        times < 1 ||
        times > HABIT_WEEKLY_TARGET_MAX
      ) {
        return {
          ok: false,
          error: `Choose between 1 and ${HABIT_WEEKLY_TARGET_MAX} times a week.`,
        };
      }
      return { ok: true, value: { type: "weekly", timesPerWeek: times } };
    }
    default:
      return { ok: false, error: "Choose how often." };
  }
}

export interface HabitDraft {
  name: string;
  area: LifeArea | null;
  schedule: HabitSchedule;
}

export type HabitDraftErrors = Partial<Record<"name" | "area" | "schedule", string>>;

export function parseHabitDraft(input: {
  name: unknown;
  area: unknown;
  schedule: HabitScheduleInput;
}): ParseResult<HabitDraft, HabitDraftErrors> {
  const name = parseHabitName(input.name);
  const area = parseLifeArea(input.area);
  const schedule = parseHabitSchedule(input.schedule);
  if (name.ok && area.ok && schedule.ok) {
    return { ok: true, value: { name: name.value, area: area.value, schedule: schedule.value } };
  }
  const errors: HabitDraftErrors = {};
  if (!name.ok) errors.name = name.error;
  if (!area.ok) errors.area = area.error;
  if (!schedule.ok) errors.schedule = schedule.error;
  return { ok: false, error: errors };
}

/** The lowest free slot (0–2) for a day's priorities, or `null` when all three are taken. */
export function firstFreePosition(taken: Iterable<number>): number | null {
  const used = new Set(taken);
  for (let position = 0; position < MAX_PRIORITIES_PER_DAY; position += 1) {
    if (!used.has(position)) return position;
  }
  return null;
}

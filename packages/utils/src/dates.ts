import type { ISODateString, Weekday } from "@levelup/types";

/*
 * Calendar-date arithmetic on `YYYY-MM-DD` strings.
 *
 * A calendar day has no time zone, so every calculation runs in UTC, where days are
 * always exactly 24 hours long. ISO dates also sort correctly as plain strings.
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

function toUTCDate(day: ISODateString): Date {
  return new Date(`${day}T00:00:00Z`);
}

function fromUTCDate(date: Date): ISODateString {
  return date.toISOString().slice(0, 10);
}

/** Whether `value` is a real calendar date written as `YYYY-MM-DD`. */
export function isISODate(value: unknown): value is ISODateString {
  if (typeof value !== "string") return false;
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** `addDays("2026-11-15", -1)` → `"2026-11-14"`. */
export function addDays(day: ISODateString, amount: number): ISODateString {
  return fromUTCDate(new Date(toUTCDate(day).getTime() + amount * DAY_MS));
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: ISODateString, to: ISODateString): number {
  return Math.round((toUTCDate(to).getTime() - toUTCDate(from).getTime()) / DAY_MS);
}

/** ISO weekday of a calendar date: 1 = Monday … 7 = Sunday. */
export function isoWeekday(day: ISODateString): Weekday {
  return (((toUTCDate(day).getUTCDay() + 6) % 7) + 1) as Weekday;
}

/** The Monday on or before `day`. */
export function startOfIsoWeek(day: ISODateString): ISODateString {
  return addDays(day, 1 - isoWeekday(day));
}

/** The `count` days ending with `last`, oldest first. */
export function lastDays(last: ISODateString, count: number): ISODateString[] {
  return Array.from({ length: count }, (_, index) => addDays(last, index - count + 1));
}

/** Whether `timeZone` is an IANA zone this runtime understands, e.g. `"Asia/Kolkata"`. */
export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone || timeZone.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/**
 * The calendar date of `instant` in a time zone (the runtime's own zone when omitted).
 * Falls back to UTC for an unknown zone rather than throwing.
 */
export function localDateInTimeZone(instant: Date, timeZone?: string): ISODateString {
  const zone = timeZone && isValidTimeZone(timeZone) ? timeZone : timeZone ? "UTC" : undefined;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/**
 * Formats a calendar date, e.g. `formatISODate("2026-11-15", "en-GB", { weekday: "short",
 * day: "numeric", month: "short" })` → "Sun 15 Nov". Formatted in UTC so the date
 * never shifts across midnight.
 */
export function formatISODate(
  day: ISODateString,
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(toUTCDate(day));
}

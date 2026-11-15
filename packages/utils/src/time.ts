export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

/** Buckets a local time: 05–11 morning, 12–16 afternoon, 17–21 evening, otherwise night. */
export function getTimeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

const salutations: Record<TimeOfDay, string> = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
  night: "Good evening",
};

/** "Good morning, Sam" — or just "Good morning" when no name is known. */
export function getGreeting(date: Date, name?: string | null): string {
  const salutation = salutations[getTimeOfDay(date)];
  const trimmed = name?.trim();
  return trimmed ? `${salutation}, ${trimmed}` : salutation;
}

/** Monday-first weekday index: Monday = 0 … Sunday = 6. */
export function getWeekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** Formats a local `Date` as `YYYY-MM-DD` without converting to UTC. */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** "Tuesday, 10 November" in the given locale. */
export function formatLongDate(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

/**
 * Formats a `YYYY-MM-DD` calendar date (e.g. a goal's target date) as "Mar 2027".
 * Calendar dates are timezone-free, so they are formatted in UTC to avoid
 * shifting across midnight.
 */
export function formatMonthYear(isoDate: string, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

/** Monday-first weekday labels, e.g. `["Mon", "Tue", …]` or narrow `["M", "T", …]`. */
export function getWeekdayLabels(
  locale?: string,
  width: "short" | "narrow" | "long" = "short",
): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: width, timeZone: "UTC" });
  // 2024-01-01 was a Monday.
  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(new Date(Date.UTC(2024, 0, 1 + index))),
  );
}

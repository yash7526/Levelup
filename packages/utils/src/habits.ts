import type {
  Fraction,
  Habit,
  HabitCheckin,
  HabitDayStatus,
  HabitSchedule,
  HabitSummary,
  ISODateString,
  ISODateTimeString,
  Weekday,
} from "@levelup/types";

import { APP_LOCALE } from "./copy";
import { addDays, isoWeekday, lastDays, startOfIsoWeek } from "./dates";
import { getWeekdayLabels } from "./time";

/** Monday-first ISO weekdays. */
export const WEEKDAYS: readonly Weekday[] = [1, 2, 3, 4, 5, 6, 7];

/** Days shown in a habit's recent history (and how far back a check-in can be changed). */
export const HABIT_HISTORY_DAYS = 7;

/** Whether a habit is expected on `day`. "N times a week" habits can happen on any day. */
export function isScheduledOn(schedule: HabitSchedule, day: ISODateString): boolean {
  if (schedule.type === "weekdays") return schedule.days.includes(isoWeekday(day));
  return true;
}

function sameDays(days: readonly Weekday[], expected: readonly Weekday[]): boolean {
  return days.length === expected.length && expected.every((day) => days.includes(day));
}

/** "Every day", "Weekdays", "Mon, Wed, Fri", "3 times a week"… */
export function describeSchedule(schedule: HabitSchedule, locale: string = APP_LOCALE): string {
  switch (schedule.type) {
    case "daily":
      return "Every day";
    case "weekdays": {
      if (schedule.days.length === 7) return "Every day";
      if (sameDays(schedule.days, [1, 2, 3, 4, 5])) return "Weekdays";
      if (sameDays(schedule.days, [6, 7])) return "Weekends";
      const labels = getWeekdayLabels(locale, "short");
      return WEEKDAYS.filter((day) => schedule.days.includes(day))
        .map((day) => labels[day - 1])
        .join(", ");
    }
    case "weekly":
      if (schedule.timesPerWeek === 1) return "Once a week";
      if (schedule.timesPerWeek === 2) return "Twice a week";
      return `${schedule.timesPerWeek} times a week`;
  }
}

interface SummarizeHabitInput {
  habit: Pick<Habit, "id" | "name" | "area" | "schedule">;
  /** Days on which this habit was completed. */
  checkinDays: ReadonlySet<ISODateString>;
  today: ISODateString;
  /** The local calendar day the habit was created; nothing is expected before it. */
  startDay: ISODateString;
}

/** Counts check-ins per ISO week (keyed by the week's Monday). */
function countByWeek(days: Iterable<ISODateString>): Map<ISODateString, number> {
  const counts = new Map<ISODateString, number>();
  for (const day of days) {
    const week = startOfIsoWeek(day);
    counts.set(week, (counts.get(week) ?? 0) + 1);
  }
  return counts;
}

function dayStreak(
  schedule: HabitSchedule,
  checkinDays: ReadonlySet<ISODateString>,
  today: ISODateString,
  start: ISODateString,
): number {
  let streak = 0;
  // Today only counts once done; until then the streak runs up to yesterday.
  let day = checkinDays.has(today) ? today : addDays(today, -1);
  for (; day >= start; day = addDays(day, -1)) {
    if (!isScheduledOn(schedule, day)) continue;
    if (!checkinDays.has(day)) break;
    streak += 1;
  }
  return streak;
}

function weekStreak(
  target: number,
  weekCounts: ReadonlyMap<ISODateString, number>,
  today: ISODateString,
  start: ISODateString,
): number {
  let streak = 0;
  let week = startOfIsoWeek(today);
  // The current week only counts once its target is met.
  if ((weekCounts.get(week) ?? 0) < target) week = addDays(week, -7);
  const firstWeek = startOfIsoWeek(start);
  for (; week >= firstWeek; week = addDays(week, -7)) {
    if ((weekCounts.get(week) ?? 0) < target) break;
    streak += 1;
  }
  return streak;
}

interface HabitDayStatusInput {
  schedule: HabitSchedule;
  day: ISODateString;
  /** Whether the habit was completed on `day`. */
  done: boolean;
  today: ISODateString;
  /** The first day the habit existed. */
  start: ISODateString;
  /** Whether the habit is expected today (see `HabitSummary.dueToday`). */
  dueToday: boolean;
}

/** How a habit went on one day. Also used to update the UI before the server confirms. */
export function habitDayStatus({
  schedule,
  day,
  done,
  today,
  start,
  dueToday,
}: HabitDayStatusInput): HabitDayStatus {
  if (done) return "done";
  if (day < start || day > today) return "off";
  if (day === today) return dueToday ? "open" : "off";
  // "N times a week" habits have no specific days to miss.
  if (schedule.type === "weekly") return "off";
  return isScheduledOn(schedule, day) ? "missed" : "off";
}

/** Derives everything overview surfaces show about a habit from its check-ins. */
export function summarizeHabit({
  habit,
  checkinDays,
  today,
  startDay,
}: SummarizeHabitInput): HabitSummary {
  const { schedule } = habit;
  // A check-in can predate the creation day (e.g. created just after midnight elsewhere).
  let start = startDay;
  for (const day of checkinDays) if (day < start) start = day;

  const completedToday = checkinDays.has(today);
  const started = today >= start;

  let dueToday: boolean;
  let currentStreak: number;
  let weekProgress: Fraction | null = null;

  if (schedule.type === "weekly") {
    const weekCounts = countByWeek(checkinDays);
    const thisWeek = weekCounts.get(startOfIsoWeek(today)) ?? 0;
    weekProgress = { completed: thisWeek, total: schedule.timesPerWeek };
    dueToday = started && (completedToday || thisWeek < schedule.timesPerWeek);
    currentStreak = weekStreak(schedule.timesPerWeek, weekCounts, today, start);
  } else {
    dueToday = started && isScheduledOn(schedule, today);
    currentStreak = dayStreak(schedule, checkinDays, today, start);
  }

  const recentDays: HabitDayStatus[] = lastDays(today, HABIT_HISTORY_DAYS).map((day) =>
    habitDayStatus({ schedule, day, done: checkinDays.has(day), today, start, dueToday }),
  );

  return {
    id: habit.id,
    name: habit.name,
    area: habit.area,
    schedule,
    dueToday,
    completedToday,
    currentStreak,
    streakUnit: schedule.type === "weekly" ? "week" : "day",
    weekProgress,
    recentDays,
  };
}

/**
 * Summaries for a list of habits, in the given order.
 * `toLocalDay` converts a timestamp to the viewer's calendar day.
 */
export function summarizeHabits(
  habits: readonly Habit[],
  checkins: readonly HabitCheckin[],
  today: ISODateString,
  toLocalDay: (instant: ISODateTimeString) => ISODateString,
): HabitSummary[] {
  const daysByHabit = new Map<string, Set<ISODateString>>();
  for (const checkin of checkins) {
    let days = daysByHabit.get(checkin.habitId);
    if (!days) {
      days = new Set();
      daysByHabit.set(checkin.habitId, days);
    }
    days.add(checkin.day);
  }
  return habits.map((habit) =>
    summarizeHabit({
      habit,
      checkinDays: daysByHabit.get(habit.id) ?? new Set(),
      today,
      startDay: toLocalDay(habit.createdAt),
    }),
  );
}

/** "12-day streak", "3-week streak", or "No streak yet". */
export function describeStreak(
  summary: Pick<HabitSummary, "currentStreak" | "streakUnit">,
): string {
  if (summary.currentStreak <= 0) return "No streak yet";
  return `${summary.currentStreak}-${summary.streakUnit} streak`;
}

/**
 * A habit summary with one recent day's check-in changed, so the UI can respond at
 * once. Streaks are left for the server to recompute.
 */
export function previewCheckin(
  summary: HabitSummary,
  change: { day: ISODateString; done: boolean; today: ISODateString; start: ISODateString },
): HabitSummary {
  const { day, done, today, start } = change;
  const days = lastDays(today, summary.recentDays.length);
  const index = days.indexOf(day);
  if (index === -1 || (summary.recentDays[index] === "done") === done) return summary;

  const completedToday = day === today ? done : summary.completedToday;
  let { dueToday, weekProgress } = summary;
  if (summary.schedule.type === "weekly" && weekProgress && day >= startOfIsoWeek(today)) {
    const completed = weekProgress.completed + (done ? 1 : -1);
    weekProgress = { completed, total: weekProgress.total };
    dueToday = today >= start && (completedToday || completed < weekProgress.total);
  }

  const lastIndex = days.length - 1;
  const recentDays = summary.recentDays.map((status, position) => {
    const date = days[position];
    if (date === undefined || (position !== index && position !== lastIndex)) return status;
    const isDone = position === index ? done : status === "done";
    return habitDayStatus({
      schedule: summary.schedule,
      day: date,
      done: isDone,
      today,
      start,
      dueToday,
    });
  });

  return { ...summary, completedToday, dueToday, weekProgress, recentDays };
}

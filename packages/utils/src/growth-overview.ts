import type {
  DashboardSnapshot,
  GrowthData,
  HabitSummary,
  ISODateString,
  PlanningData,
  ISODateTimeString,
  PriorityEntry,
  WeeklyActivity,
} from "@levelup/types";

import { isoWeekday, startOfIsoWeek } from "./dates";
import { summarizeHabits } from "./habits";
import { dashboardGoals, dashboardLearning } from "./planning";

/** Today's priorities in slot order. */
export function prioritiesForDay(
  priorities: readonly PriorityEntry[],
  day: ISODateString,
): PriorityEntry[] {
  return priorities
    .filter((priority) => priority.day === day)
    .sort((a, b) => a.position - b.position);
}

/** One completion per finished priority and per habit check-in, counted per day this week. */
export function buildWeeklyActivity(
  today: ISODateString,
  completedDays: Iterable<ISODateString>,
): WeeklyActivity {
  const weekStart = startOfIsoWeek(today);
  const completions = [0, 0, 0, 0, 0, 0, 0];
  for (const day of completedDays) {
    if (day < weekStart || day > today) continue;
    const index = isoWeekday(day) - 1;
    completions[index] = (completions[index] ?? 0) + 1;
  }
  return { completions };
}

/** Active habits (not archived), summarised for today. */
export function summarizeActiveHabits(
  data: GrowthData,
  toLocalDay: (instant: ISODateTimeString) => ISODateString,
): HabitSummary[] {
  return summarizeHabits(
    data.habits.filter((habit) => habit.archivedAt === null),
    data.checkins,
    data.today,
    toLocalDay,
  );
}

/**
 * The live dashboard from real priorities, habits, goals and learning. The coach stays
 * empty until its module exists.
 */
export function buildDashboardSnapshot(
  data: GrowthData,
  toLocalDay: (instant: ISODateTimeString) => ISODateString,
  planning: PlanningData | null = null,
): DashboardSnapshot {
  const habits = summarizeActiveHabits(data, toLocalDay);
  const priorities = prioritiesForDay(data.priorities, data.today).map(
    ({ id, title, status, area }) => ({ id, title, status, area }),
  );

  const weekStart = startOfIsoWeek(data.today);
  const weekPriorities = data.priorities.filter(
    (priority) => priority.day >= weekStart && priority.day <= data.today,
  );
  // Nothing tracked this week yet: show the empty state rather than a flat chart.
  const tracksAnything = habits.length > 0 || weekPriorities.length > 0;
  const weeklyActivity = tracksAnything
    ? buildWeeklyActivity(data.today, [
        ...weekPriorities.filter((priority) => priority.status === "done").map((p) => p.day),
        ...data.checkins.map((checkin) => checkin.day),
      ])
    : null;

  return {
    source: "live",
    priorities,
    habits,
    goals: planning ? dashboardGoals(planning) : [],
    learning: planning ? dashboardLearning(planning) : [],
    weeklyActivity,
    coachInsight: null,
  };
}

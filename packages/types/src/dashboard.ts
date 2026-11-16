import type { DataSource, ISODateString } from "./common";
import type {
  CoachInsight,
  GoalSummary,
  Habit,
  HabitCheckin,
  HabitSummary,
  LearningItemSummary,
  Priority,
  PriorityEntry,
  WeeklyActivity,
} from "./growth";

/**
 * Everything the dashboard renders. Each section can be empty; empty is a
 * first-class state, not an error.
 */
export interface DashboardSnapshot {
  source: DataSource;
  priorities: readonly Priority[];
  habits: readonly HabitSummary[];
  goals: readonly GoalSummary[];
  learning: readonly LearningItemSummary[];
  weeklyActivity: WeeklyActivity | null;
  coachInsight: CoachInsight | null;
}

/** One viewer's Today and Habits data, loaded around a calendar day. */
export interface GrowthData {
  /** The viewer's current calendar day. */
  today: ISODateString;
  /** Active and archived habits, oldest first. */
  habits: readonly Habit[];
  /** Check-ins within the history window, up to today. */
  checkins: readonly HabitCheckin[];
  /** Priorities from Monday of this week up to today. */
  priorities: readonly PriorityEntry[];
  /** Unfinished priorities from recent days before today, newest first. */
  carryOver: readonly PriorityEntry[];
}

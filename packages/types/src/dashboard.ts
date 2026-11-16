import type { DataSource, ISODateString } from "./common";
import type {
  CoachInsight,
  Goal,
  GoalSummary,
  Habit,
  HabitCheckin,
  HabitSummary,
  LearningItem,
  LearningItemSummary,
  LearningSession,
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

/** One viewer's Goals and Learning data. */
export interface PlanningData {
  /** The viewer's current calendar day. */
  today: ISODateString;
  /** Every goal (active, paused and completed), newest first, with milestones. */
  goals: readonly Goal[];
  /** Every learning item, active and archived, oldest first. */
  learning: readonly LearningItem[];
  /** Recent sessions, newest first. */
  sessions: readonly LearningSession[];
}

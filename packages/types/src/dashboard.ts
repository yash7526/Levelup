import type { DataSource } from "./common";
import type {
  CoachInsight,
  GoalSummary,
  HabitSummary,
  LearningItemSummary,
  Priority,
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

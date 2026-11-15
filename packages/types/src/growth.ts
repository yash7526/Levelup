import type { Fraction, Id, ISODateString } from "./common";

/** Areas of life that priorities, habits and goals can belong to. */
export type LifeArea =
  "health" | "mind" | "career" | "learning" | "relationships" | "finance" | "creativity";

export type PriorityStatus = "open" | "done";

/** One of the few things that matter most today. */
export interface Priority {
  id: Id;
  title: string;
  status: PriorityStatus;
  area: LifeArea | null;
}

/** A habit as summarised for overview surfaces such as the dashboard. */
export interface HabitSummary {
  id: Id;
  name: string;
  area: LifeArea | null;
  /** Whether the habit is scheduled for today. */
  dueToday: boolean;
  completedToday: boolean;
  /** Consecutive scheduled days completed, including today when done. */
  currentStreak: number;
  /** Completion for the last seven days, oldest first; the last entry is today. */
  recentDays: readonly boolean[];
}

export type GoalStatus = "active" | "paused" | "completed";

export interface GoalSummary {
  id: Id;
  title: string;
  area: LifeArea | null;
  status: GoalStatus;
  /** Progress is derived from milestones, never stored as a free-floating percentage. */
  milestones: Fraction;
  targetDate: ISODateString | null;
}

export type LearningKind = "course" | "book" | "skill" | "article";
export type LearningUnit = "lessons" | "chapters" | "pages" | "modules";

export interface LearningItemSummary {
  id: Id;
  title: string;
  kind: LearningKind;
  progress: Fraction;
  unit: LearningUnit;
}

/**
 * Completed priorities and habits per day for the current week.
 * `completions` has seven entries, Monday first.
 */
export interface WeeklyActivity {
  completions: readonly number[];
}

export interface CoachInsight {
  id: Id;
  /** Observation about the person's recent activity. */
  message: string;
  /** A single, concrete next step. */
  suggestion: string | null;
}

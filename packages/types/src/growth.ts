import type { Fraction, Id, ISODateString, ISODateTimeString } from "./common";

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

/** A stored priority: belongs to one calendar day and one of its three slots. */
export interface PriorityEntry extends Priority {
  day: ISODateString;
  /** Slot within the day, 0–2. */
  position: number;
  completedAt: ISODateTimeString | null;
}

/** ISO weekday: 1 = Monday … 7 = Sunday. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** When a habit is meant to happen. */
export type HabitSchedule =
  | { type: "daily" }
  | { type: "weekdays"; days: readonly Weekday[] }
  | { type: "weekly"; timesPerWeek: number };

export interface Habit {
  id: Id;
  name: string;
  area: LifeArea | null;
  schedule: HabitSchedule;
  createdAt: ISODateTimeString;
  archivedAt: ISODateTimeString | null;
}

/** A habit completed on a calendar day. */
export interface HabitCheckin {
  id: Id;
  habitId: Id;
  day: ISODateString;
}

/**
 * How a habit went on one day:
 * - `done`: completed;
 * - `missed`: scheduled and not completed (past days only);
 * - `open`: due today and not completed yet;
 * - `off`: not scheduled (or before the habit existed), nothing expected.
 */
export type HabitDayStatus = "done" | "missed" | "open" | "off";

/** A habit as summarised for overview surfaces such as the dashboard. */
export interface HabitSummary {
  id: Id;
  name: string;
  area: LifeArea | null;
  schedule: HabitSchedule;
  /** Whether the habit is expected today. */
  dueToday: boolean;
  completedToday: boolean;
  /**
   * Consecutive scheduled days (or, for "N times a week" habits, weeks that met the
   * target) completed. Today only counts once done, so an open day never breaks it.
   */
  currentStreak: number;
  streakUnit: "day" | "week";
  /** Check-ins this week against the target, for "N times a week" habits only. */
  weekProgress: Fraction | null;
  /** The last seven days, oldest first; the last entry is today. */
  recentDays: readonly HabitDayStatus[];
}

export type GoalStatus = "active" | "paused" | "completed";

export interface GoalMilestone {
  id: Id;
  goalId: Id;
  title: string;
  /** Order within the goal, starting at 0. */
  position: number;
  completedAt: ISODateTimeString | null;
}

/** A stored goal with its milestones in order. */
export interface Goal {
  id: Id;
  title: string;
  area: LifeArea | null;
  status: GoalStatus;
  targetDate: ISODateString | null;
  completedAt: ISODateTimeString | null;
  createdAt: ISODateTimeString;
  milestones: readonly GoalMilestone[];
}

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

/** A stored learning item. */
export interface LearningItem {
  id: Id;
  title: string;
  kind: LearningKind;
  unit: LearningUnit;
  total: number;
  completed: number;
  createdAt: ISODateTimeString;
  archivedAt: ISODateTimeString | null;
}

export interface LearningSession {
  id: Id;
  itemId: Id;
  day: ISODateString;
  minutes: number;
  note: string | null;
}

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

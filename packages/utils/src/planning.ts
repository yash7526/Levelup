import type {
  Fraction,
  Goal,
  GoalStatus,
  GoalSummary,
  ISODateString,
  LearningItem,
  LearningItemSummary,
  LearningSession,
  LearningUnit,
  PlanningData,
} from "@levelup/types";

import { addDays, daysBetween, startOfIsoWeek } from "./dates";
import { clamp } from "./progress";
import { normalizeDisplayName } from "./text";

export const GOAL_TITLE_MAX_LENGTH = 120;
export const MILESTONE_TITLE_MAX_LENGTH = 120;
export const MAX_MILESTONES_PER_GOAL = 30;
export const LEARNING_TITLE_MAX_LENGTH = 120;
export const LEARNING_TOTAL_MAX = 100_000;
export const SESSION_NOTE_MAX_LENGTH = 500;
export const SESSION_MINUTES_MAX = 1440;

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

function parseTitle(input: unknown, max: number, empty: string): ParseResult<string> {
  const cleaned = normalizeDisplayName(
    typeof input === "string" ? input : "",
    Number.MAX_SAFE_INTEGER,
  );
  if (!cleaned) return { ok: false, error: empty };
  if (Array.from(cleaned).length > max) {
    return { ok: false, error: `Keep it to ${max} characters or fewer.` };
  }
  return { ok: true, value: cleaned };
}

export const parseGoalTitle = (input: unknown) =>
  parseTitle(input, GOAL_TITLE_MAX_LENGTH, "Give your goal a name.");
export const parseMilestoneTitle = (input: unknown) =>
  parseTitle(input, MILESTONE_TITLE_MAX_LENGTH, "Write the milestone.");
export const parseLearningTitle = (input: unknown) =>
  parseTitle(input, LEARNING_TITLE_MAX_LENGTH, "Give it a title.");

/** A whole number within `[min, max]`, from a number or numeric string. */
export function parseWholeNumber(
  input: unknown,
  min: number,
  max: number,
  label: string,
): ParseResult<number> {
  const value = typeof input === "string" && input.trim() !== "" ? Number(input) : input;
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    return { ok: false, error: `${label} must be a whole number from ${min} to ${max}.` };
  }
  return { ok: true, value };
}

/** An optional target date: empty means none; it must be a real date. */
export function parseTargetDate(input: unknown): ParseResult<ISODateString | null> {
  if (input === null || input === undefined || input === "") return { ok: true, value: null };
  if (typeof input !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return { ok: false, error: "Choose a valid date." };
  }
  const date = new Date(`${input}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== input) {
    return { ok: false, error: "Choose a valid date." };
  }
  return { ok: true, value: input };
}

export function parseSessionNote(input: unknown): ParseResult<string | null> {
  const raw = typeof input === "string" ? input.trim() : "";
  if (!raw) return { ok: true, value: null };
  if (Array.from(raw).length > SESSION_NOTE_MAX_LENGTH) {
    return { ok: false, error: `Keep it to ${SESSION_NOTE_MAX_LENGTH} characters or fewer.` };
  }
  return { ok: true, value: raw };
}

export const goalStatusLabels: Record<GoalStatus, string> = {
  active: "Active",
  paused: "Paused",
  completed: "Completed",
};

export const learningUnitLabels: Record<LearningUnit, { singular: string; plural: string }> = {
  lessons: { singular: "lesson", plural: "lessons" },
  chapters: { singular: "chapter", plural: "chapters" },
  pages: { singular: "page", plural: "pages" },
  modules: { singular: "module", plural: "modules" },
};

/** Milestones done out of total. A goal with no milestones has nothing to measure. */
export function goalProgress(goal: Pick<Goal, "milestones">): Fraction {
  return {
    completed: goal.milestones.filter((milestone) => milestone.completedAt !== null).length,
    total: goal.milestones.length,
  };
}

/** Where a goal's target date stands relative to today. */
export type TargetState =
  | { kind: "none" }
  | { kind: "upcoming"; days: number }
  | { kind: "today" }
  | { kind: "overdue"; days: number };

export function targetState(targetDate: ISODateString | null, today: ISODateString): TargetState {
  if (!targetDate) return { kind: "none" };
  const days = daysBetween(today, targetDate);
  if (days === 0) return { kind: "today" };
  return days > 0 ? { kind: "upcoming", days } : { kind: "overdue", days: -days };
}

export function summarizeGoal(goal: Goal): GoalSummary {
  return {
    id: goal.id,
    title: goal.title,
    area: goal.area,
    status: goal.status,
    milestones: goalProgress(goal),
    targetDate: goal.targetDate,
  };
}

export function learningProgress(item: Pick<LearningItem, "completed" | "total">): Fraction {
  return { completed: clamp(item.completed, 0, item.total), total: item.total };
}

export function summarizeLearningItem(item: LearningItem): LearningItemSummary {
  return {
    id: item.id,
    title: item.title,
    kind: item.kind,
    unit: item.unit,
    progress: learningProgress(item),
  };
}

/** Total minutes studied from Monday through today. */
export function sessionMinutesThisWeek(
  sessions: readonly LearningSession[],
  today: ISODateString,
): number {
  const weekStart = startOfIsoWeek(today);
  return sessions
    .filter((session) => session.day >= weekStart && session.day <= today)
    .reduce((total, session) => total + session.minutes, 0);
}

/** Consecutive days up to today (or yesterday) with at least one session. */
export function studyStreak(sessions: readonly LearningSession[], today: ISODateString): number {
  const days = new Set(sessions.map((session) => session.day));
  let day = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(day)) {
    streak += 1;
    day = addDays(day, -1);
  }
  return streak;
}

/** Goals worth showing on the dashboard: active ones, nearest target date first. */
export function dashboardGoals(data: PlanningData): GoalSummary[] {
  return data.goals
    .filter((goal) => goal.status === "active")
    .sort((a, b) => {
      if (a.targetDate && b.targetDate) return a.targetDate.localeCompare(b.targetDate);
      if (a.targetDate) return -1;
      if (b.targetDate) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    })
    .map(summarizeGoal);
}

/** Learning items still in progress (not archived or finished). */
export function dashboardLearning(data: PlanningData): LearningItemSummary[] {
  return data.learning
    .filter((item) => item.archivedAt === null && item.completed < item.total)
    .map(summarizeLearningItem);
}

import type { Fraction, HabitSummary, Priority } from "@levelup/types";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Whole-number percentage (0–100). Returns 0 when there is nothing to complete. */
export function toPercent({ completed, total }: Fraction): number {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.round(clamp(completed / total, 0, 1) * 100);
}

export interface TodayProgress {
  priorities: Fraction;
  habits: Fraction;
  overall: Fraction;
  percent: number;
}

/** Today's progress, derived from the actual priorities and habits due today. */
export function summarizeTodayProgress(
  priorities: readonly Priority[],
  habits: readonly HabitSummary[],
): TodayProgress {
  const dueHabits = habits.filter((habit) => habit.dueToday);

  const priorityFraction: Fraction = {
    completed: priorities.filter((priority) => priority.status === "done").length,
    total: priorities.length,
  };
  const habitFraction: Fraction = {
    completed: dueHabits.filter((habit) => habit.completedToday).length,
    total: dueHabits.length,
  };
  const overall: Fraction = {
    completed: priorityFraction.completed + habitFraction.completed,
    total: priorityFraction.total + habitFraction.total,
  };

  return {
    priorities: priorityFraction,
    habits: habitFraction,
    overall,
    percent: toPercent(overall),
  };
}

export function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

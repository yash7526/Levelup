import type {
  CoachInsight,
  CoachReport,
  GrowthData,
  HabitSummary,
  ISODateString,
  ISODateTimeString,
  PlanningData,
  WeekReview,
} from "@levelup/types";

import { addDays, daysBetween, isoWeekday, startOfIsoWeek } from "./dates";
import { isScheduledOn, summarizeHabits } from "./habits";
import { goalProgress, studyStreak, targetState } from "./planning";
import { pluralize } from "./text";

/*
 * The coach is a transparent rules engine, not a language model: every message is built
 * from the person's own records and states the numbers it rests on. Nothing leaves the
 * device or account, and nothing is invented. Each rule has a priority (lower is more
 * important); the best few are shown.
 */

interface Candidate {
  priority: number;
  insight: CoachInsight;
}

export const MAX_COACH_INSIGHTS = 6;

/** A streak this long is worth protecting out loud. */
const STREAK_WORTH_PROTECTING = 3;
const STREAK_WORTH_CELEBRATING = 7;
const STALLED_LEARNING_DAYS = 7;
const SOON_DAYS = 7;
const STALE_CARRY_OVER_DAYS = 3;

type LocalDay = (instant: ISODateTimeString) => ISODateString;

function habitRules(habits: readonly HabitSummary[], today: ISODateString, out: Candidate[]): void {
  const daysAfterToday = 7 - isoWeekday(today);

  for (const habit of habits) {
    const unit = habit.streakUnit === "week" ? "week" : "day";

    if (
      habit.streakUnit === "day" &&
      habit.dueToday &&
      !habit.completedToday &&
      habit.currentStreak >= STREAK_WORTH_PROTECTING
    ) {
      out.push({
        priority: 10,
        insight: {
          id: `streak-at-risk:${habit.id}`,
          tone: "nudge",
          focus: "habits",
          message: `Your ${habit.currentStreak}-day streak on "${habit.name}" is still open today.`,
          suggestion: `Do "${habit.name}" before the day ends to keep it going.`,
        },
      });
    }

    if (habit.weekProgress && !habit.completedToday) {
      const need = habit.weekProgress.total - habit.weekProgress.completed;
      const chances = daysAfterToday + 1;
      if (need > 0 && need >= chances) {
        out.push({
          priority: 20,
          insight: {
            id: `weekly-behind:${habit.id}`,
            tone: "nudge",
            focus: "habits",
            message: `"${habit.name}" needs ${need} more this week and only ${pluralize(chances, "day")} remain, including today.`,
            suggestion:
              need > chances
                ? "This week's target is out of reach now, so aim to start next week strong."
                : "Do it today, and on each remaining day, to still make this week's target.",
          },
        });
      }
    }

    const missed = habit.recentDays.filter((status) => status === "missed").length;
    if (habit.streakUnit === "day" && missed >= 3) {
      out.push({
        priority: 50,
        insight: {
          id: `slipping:${habit.id}`,
          tone: "nudge",
          focus: "habits",
          message: `"${habit.name}" was missed ${missed} times in the last 7 days.`,
          suggestion:
            "Shrink it to the smallest version you could do on your worst day, or change its schedule.",
        },
      });
    }

    if (habit.completedToday && habit.currentStreak >= STREAK_WORTH_CELEBRATING) {
      out.push({
        priority: 75,
        insight: {
          id: `streak:${habit.id}`,
          tone: "celebrate",
          focus: "habits",
          message: `${habit.currentStreak} ${unit}s in a row on "${habit.name}".`,
          suggestion: "Consistency like this is how habits become part of you.",
        },
      });
    }
  }
}

function priorityRules(
  data: GrowthData,
  habits: readonly HabitSummary[],
  anythingTracked: boolean,
  out: Candidate[],
): void {
  const todays = data.priorities.filter((entry) => entry.day === data.today);

  if (todays.length === 0 && anythingTracked) {
    out.push({
      priority: 40,
      insight: {
        id: "no-priorities",
        tone: "nudge",
        focus: "today",
        message: "You haven't chosen any priorities for today.",
        suggestion: "Pick the one thing that would make today a win.",
      },
    });
  }

  const stale = data.carryOver.filter(
    (entry) => daysBetween(entry.day, data.today) >= STALE_CARRY_OVER_DAYS,
  );
  if (stale.length > 0) {
    out.push({
      priority: 45,
      insight: {
        id: "stale-carry-over",
        tone: "nudge",
        focus: "today",
        message: `${pluralize(stale.length, "priority", "priorities")} from at least ${STALE_CARRY_OVER_DAYS} days ago ${stale.length === 1 ? "is" : "are"} still unfinished.`,
        suggestion: "Bring the one that matters into today, or let the rest go.",
      },
    });
  }

  if (todays.length > 0 && todays.every((entry) => entry.status === "done")) {
    const dueHabits = habits.filter((habit) => habit.dueToday || habit.completedToday);
    const habitsDone = dueHabits.every((habit) => habit.completedToday);
    out.push({
      priority: 70,
      insight: {
        id: "priorities-done",
        tone: "celebrate",
        focus: "today",
        message: `All ${pluralize(todays.length, "priority", "priorities")} done today.`,
        suggestion: habitsDone
          ? "Everything planned for today is finished. Enjoy the rest of it."
          : "Finish today's remaining habits to close out the day.",
      },
    });
  }
}

function goalRules(
  planning: PlanningData,
  toLocalDay: LocalDay,
  today: ISODateString,
  out: Candidate[],
): void {
  for (const goal of planning.goals) {
    if (goal.status !== "active") continue;
    const progress = goalProgress(goal);
    const target = targetState(goal.targetDate, today);

    if (target.kind === "overdue") {
      out.push({
        priority: 30,
        insight: {
          id: `goal-overdue:${goal.id}`,
          tone: "nudge",
          focus: "goals",
          message: `"${goal.title}" passed its target date ${pluralize(target.days, "day")} ago with ${progress.completed} of ${progress.total} milestones done.`,
          suggestion: "Set a new target date, or pause the goal if it no longer fits.",
        },
      });
    } else if (
      (target.kind === "upcoming" && target.days <= SOON_DAYS) ||
      target.kind === "today"
    ) {
      const left = progress.total - progress.completed;
      if (left > 0) {
        out.push({
          priority: 35,
          insight: {
            id: `goal-soon:${goal.id}`,
            tone: "nudge",
            focus: "goals",
            message:
              target.kind === "today"
                ? `"${goal.title}" is due today with ${pluralize(left, "milestone")} to go.`
                : `"${goal.title}" is due in ${pluralize(target.days, "day")} with ${pluralize(left, "milestone")} to go.`,
            suggestion: "Pick the next milestone and put it in today's priorities.",
          },
        });
      }
    }

    if (progress.total === 0) {
      out.push({
        priority: 55,
        insight: {
          id: `goal-empty:${goal.id}`,
          tone: "info",
          focus: "goals",
          message: `"${goal.title}" has no milestones yet, so there's nothing to measure.`,
          suggestion: "Break it into 3 to 5 steps you can actually finish.",
        },
      });
    }
  }

  const weekStart = startOfIsoWeek(today);
  const finished = planning.goals
    .flatMap((goal) => goal.milestones)
    .filter((milestone) => milestone.completedAt && toLocalDay(milestone.completedAt) >= weekStart);
  if (finished.length >= 2) {
    out.push({
      priority: 72,
      insight: {
        id: "milestones-week",
        tone: "celebrate",
        focus: "goals",
        message: `${finished.length} milestones reached this week.`,
        suggestion: "Take a moment to notice the progress before choosing the next step.",
      },
    });
  }
}

function learningRules(
  planning: PlanningData,
  toLocalDay: LocalDay,
  today: ISODateString,
  out: Candidate[],
): void {
  const lastSession = new Map<string, ISODateString>();
  for (const session of planning.sessions) {
    const known = lastSession.get(session.itemId);
    if (!known || session.day > known) lastSession.set(session.itemId, session.day);
  }

  for (const item of planning.learning) {
    if (item.archivedAt !== null || item.completed >= item.total) continue;
    const since = lastSession.get(item.id) ?? toLocalDay(item.createdAt);
    const idle = daysBetween(since, today);
    if (idle >= STALLED_LEARNING_DAYS) {
      out.push({
        priority: 60,
        insight: {
          id: `learning-stalled:${item.id}`,
          tone: "nudge",
          focus: "learning",
          message: lastSession.has(item.id)
            ? `You haven't studied "${item.title}" for ${pluralize(idle, "day")}.`
            : `You added "${item.title}" ${pluralize(idle, "day")} ago and haven't logged a session yet.`,
          suggestion: "A 15-minute session today is enough to get moving again.",
        },
      });
    }
  }

  const streak = studyStreak(planning.sessions, today);
  if (streak >= 3) {
    out.push({
      priority: 80,
      insight: {
        id: "study-streak",
        tone: "celebrate",
        focus: "learning",
        message: `You've studied ${pluralize(streak, "day")} in a row.`,
        suggestion: "Keep the sessions short and the streak will take care of itself.",
      },
    });
  }
}

/** The week so far (Monday through today) from real records. */
export function buildWeekReview(
  growth: GrowthData,
  planning: PlanningData | null,
  toLocalDay: LocalDay,
): WeekReview {
  const today = growth.today;
  const weekStart = startOfIsoWeek(today);

  const weekPriorities = growth.priorities.filter(
    (entry) => entry.day >= weekStart && entry.day <= today,
  );
  const checkinDays = new Map<string, Set<ISODateString>>();
  for (const checkin of growth.checkins) {
    const days = checkinDays.get(checkin.habitId) ?? new Set();
    days.add(checkin.day);
    checkinDays.set(checkin.habitId, days);
  }

  let habitCheckins = 0;
  let scheduled = 0;
  let done = 0;
  for (const habit of growth.habits) {
    if (habit.archivedAt !== null) continue;
    const days = checkinDays.get(habit.id) ?? new Set<ISODateString>();
    const start = toLocalDay(habit.createdAt);
    for (let day = weekStart; day <= today; day = addDays(day, 1)) {
      const isDone = days.has(day);
      if (isDone) habitCheckins += 1;
      if (habit.schedule.type === "weekly" || day < start || !isScheduledOn(habit.schedule, day)) {
        continue;
      }
      scheduled += 1;
      if (isDone) done += 1;
    }
  }

  return {
    priorities: {
      completed: weekPriorities.filter((entry) => entry.status === "done").length,
      total: weekPriorities.length,
    },
    habitCheckins,
    habitDays: { completed: done, total: scheduled },
    learningMinutes: planning
      ? planning.sessions
          .filter((session) => session.day >= weekStart && session.day <= today)
          .reduce((total, session) => total + session.minutes, 0)
      : 0,
    milestonesCompleted: planning
      ? planning.goals
          .flatMap((goal) => goal.milestones)
          .filter((m) => m.completedAt && toLocalDay(m.completedAt) >= weekStart).length
      : 0,
  };
}

/**
 * Builds the coach's report. `planning` is `null` when goals and learning couldn't be
 * loaded; the coach then says nothing about them rather than guessing.
 */
export function buildCoachReport(
  growth: GrowthData,
  planning: PlanningData | null,
  toLocalDay: LocalDay,
): CoachReport {
  const today = growth.today;
  const habits = summarizeHabits(
    growth.habits.filter((habit) => habit.archivedAt === null),
    growth.checkins,
    today,
    toLocalDay,
  );
  const candidates: Candidate[] = [];

  const activeGoals = planning?.goals.some((goal) => goal.status === "active") ?? false;
  const activeLearning =
    planning?.learning.some((item) => item.archivedAt === null && item.completed < item.total) ??
    false;
  const anythingTracked = habits.length > 0 || activeGoals || activeLearning;

  // A brand-new account has nothing to analyse; point to the first step instead.
  if (planning && !anythingTracked && growth.priorities.length === 0) {
    candidates.push({
      priority: 5,
      insight: {
        id: "get-started",
        tone: "info",
        focus: "habits",
        message: "There's nothing to look at yet. The coach learns from what you track.",
        suggestion: "Start with one habit small enough to do on your worst day.",
      },
    });
  }

  habitRules(habits, today, candidates);
  priorityRules(growth, habits, anythingTracked, candidates);
  if (planning) {
    goalRules(planning, toLocalDay, today, candidates);
    learningRules(planning, toLocalDay, today, candidates);
  }

  const insights = candidates
    .sort((a, b) => a.priority - b.priority || a.insight.id.localeCompare(b.insight.id))
    .slice(0, MAX_COACH_INSIGHTS)
    .map((candidate) => candidate.insight);

  return {
    insight: insights[0] ?? null,
    insights,
    week: buildWeekReview(growth, planning, toLocalDay),
  };
}

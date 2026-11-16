import type { Goal, LearningItem, LearningSession, PlanningData } from "@levelup/types";
import { describe, expect, it } from "vitest";

import {
  buildDashboardSnapshot,
  dashboardGoals,
  dashboardLearning,
  goalProgress,
  learningProgress,
  parseGoalTitle,
  parseSessionNote,
  parseTargetDate,
  parseWholeNumber,
  sessionMinutesThisWeek,
  studyStreak,
  targetState,
} from "./index";

const goal = (id: string, over: Partial<Goal> = {}): Goal => ({
  id,
  title: id,
  area: null,
  status: "active",
  targetDate: null,
  completedAt: null,
  createdAt: "2026-11-01T00:00:00Z",
  milestones: [],
  ...over,
});

const milestone = (id: string, done: boolean) => ({
  id,
  goalId: "g",
  title: id,
  position: 0,
  completedAt: done ? "2026-11-10T00:00:00Z" : null,
});

const item = (id: string, over: Partial<LearningItem> = {}): LearningItem => ({
  id,
  title: id,
  kind: "book",
  unit: "chapters",
  total: 10,
  completed: 0,
  createdAt: "2026-11-01T00:00:00Z",
  archivedAt: null,
  ...over,
});

const session = (day: string, minutes = 20): LearningSession => ({
  id: `${day}-${minutes}`,
  itemId: "i",
  day,
  minutes,
  note: null,
});

describe("goal progress", () => {
  it("counts completed milestones and has nothing to measure without any", () => {
    const g = goal("g", {
      milestones: [milestone("a", true), milestone("b", false), milestone("c", true)],
    });
    expect(goalProgress(g)).toEqual({ completed: 2, total: 3 });
    expect(goalProgress(goal("empty"))).toEqual({ completed: 0, total: 0 });
  });

  it("describes the target date relative to today", () => {
    expect(targetState(null, "2026-11-16")).toEqual({ kind: "none" });
    expect(targetState("2026-11-16", "2026-11-16")).toEqual({ kind: "today" });
    expect(targetState("2026-11-26", "2026-11-16")).toEqual({ kind: "upcoming", days: 10 });
    expect(targetState("2026-11-13", "2026-11-16")).toEqual({ kind: "overdue", days: 3 });
  });
});

describe("learning progress and sessions", () => {
  it("clamps progress to the total", () => {
    expect(learningProgress({ completed: 12, total: 10 })).toEqual({ completed: 10, total: 10 });
    expect(learningProgress({ completed: 3, total: 10 })).toEqual({ completed: 3, total: 10 });
  });

  it("totals this week's minutes, Monday through today", () => {
    const sessions = [
      session("2026-11-15", 50),
      session("2026-11-16", 20),
      session("2026-11-17", 30),
      session("2026-11-18", 99),
    ];
    // Today is Tuesday 17: Sunday 15 is last week and Wednesday 18 is in the future.
    expect(sessionMinutesThisWeek(sessions, "2026-11-17")).toBe(50);
  });

  it("counts consecutive study days, keeping yesterday's streak until today ends", () => {
    const sessions = [
      session("2026-11-14"),
      session("2026-11-15"),
      session("2026-11-15", 10),
      session("2026-11-12"),
    ];
    expect(studyStreak(sessions, "2026-11-15")).toBe(2);
    expect(studyStreak(sessions, "2026-11-16")).toBe(2);
    expect(studyStreak(sessions, "2026-11-17")).toBe(0);
    expect(studyStreak([], "2026-11-17")).toBe(0);
  });
});

describe("input parsing", () => {
  it("validates titles, numbers, dates and notes", () => {
    expect(parseGoalTitle("  Run   a 10k ")).toEqual({ ok: true, value: "Run a 10k" });
    expect(parseGoalTitle(" ").ok).toBe(false);
    expect(parseGoalTitle("x".repeat(121)).ok).toBe(false);

    expect(parseWholeNumber("12", 1, 100, "Total")).toEqual({ ok: true, value: 12 });
    expect(parseWholeNumber("1.5", 1, 100, "Total").ok).toBe(false);
    expect(parseWholeNumber("", 1, 100, "Total").ok).toBe(false);
    expect(parseWholeNumber(101, 1, 100, "Total").ok).toBe(false);

    expect(parseTargetDate("")).toEqual({ ok: true, value: null });
    expect(parseTargetDate("2027-02-28")).toEqual({ ok: true, value: "2027-02-28" });
    expect(parseTargetDate("2027-02-30").ok).toBe(false);
    expect(parseTargetDate("soon").ok).toBe(false);

    expect(parseSessionNote("  ")).toEqual({ ok: true, value: null });
    expect(parseSessionNote("Key idea: spacing.")).toEqual({
      ok: true,
      value: "Key idea: spacing.",
    });
    expect(parseSessionNote("x".repeat(501)).ok).toBe(false);
  });
});

describe("dashboard integration", () => {
  const planning: PlanningData = {
    today: "2026-11-16",
    goals: [
      goal("later", { targetDate: "2027-03-01" }),
      goal("paused", { status: "paused" }),
      goal("sooner", { targetDate: "2026-12-01", milestones: [milestone("m", true)] }),
      goal("undated", { createdAt: "2026-11-10T00:00:00Z" }),
    ],
    learning: [
      item("reading", { completed: 4 }),
      item("done", { completed: 10 }),
      item("old", { archivedAt: "2026-11-05T00:00:00Z" }),
    ],
    sessions: [],
  };

  it("shows active goals by nearest target and unfinished learning", () => {
    expect(dashboardGoals(planning).map((g) => g.id)).toEqual(["sooner", "later", "undated"]);
    expect(dashboardGoals(planning)[0]?.milestones).toEqual({ completed: 1, total: 1 });
    expect(dashboardLearning(planning).map((l) => l.id)).toEqual(["reading"]);
  });

  it("is included in the live snapshot, and empty without planning data", () => {
    const growth = { today: "2026-11-16", habits: [], checkins: [], priorities: [], carryOver: [] };
    const toDay = (instant: string) => instant.slice(0, 10);
    expect(buildDashboardSnapshot(growth, toDay).goals).toEqual([]);
    const snapshot = buildDashboardSnapshot(growth, toDay, planning);
    expect(snapshot.goals).toHaveLength(3);
    expect(snapshot.learning).toHaveLength(1);
  });
});

import type { GrowthData, Habit, HabitCheckin, PlanningData, PriorityEntry } from "@levelup/types";
import { describe, expect, it } from "vitest";

import { buildCoachReport, buildDashboardSnapshot } from "./index";

// 2026-11-18 is a Wednesday; its week started on Monday 2026-11-16.
const TODAY = "2026-11-18";
const toDay = (instant: string) => instant.slice(0, 10);

const habit = (id: string, over: Partial<Habit> = {}): Habit => ({
  id,
  name: id,
  area: null,
  schedule: { type: "daily" },
  createdAt: "2026-10-01T09:00:00Z",
  archivedAt: null,
  ...over,
});

const checkins = (habitId: string, days: string[]): HabitCheckin[] =>
  days.map((day) => ({ id: `${habitId}:${day}`, habitId, day }));

const priority = (id: string, day: string, done = false, position = 0): PriorityEntry => ({
  id,
  title: id,
  area: null,
  day,
  position,
  status: done ? "done" : "open",
  completedAt: done ? `${day}T10:00:00Z` : null,
});

const growth = (over: Partial<GrowthData> = {}): GrowthData => ({
  today: TODAY,
  habits: [],
  checkins: [],
  priorities: [],
  carryOver: [],
  ...over,
});

const planning = (over: Partial<PlanningData> = {}): PlanningData => ({
  today: TODAY,
  goals: [],
  learning: [],
  sessions: [],
  ...over,
});

const ids = (report: ReturnType<typeof buildCoachReport>) => report.insights.map((i) => i.id);

describe("coach: new accounts", () => {
  it("points a brand-new account to its first step instead of inventing insight", () => {
    const report = buildCoachReport(growth(), planning(), toDay);
    expect(ids(report)).toEqual(["get-started"]);
    expect(report.insight?.focus).toBe("habits");
  });

  it("stays silent about goals and learning when they couldn't be loaded", () => {
    const report = buildCoachReport(growth(), null, toDay);
    expect(report.insight).toBeNull();
    expect(report.insights).toEqual([]);
  });
});

describe("coach: habits", () => {
  it("warns when a long streak is still open today", () => {
    const days = ["2026-11-14", "2026-11-15", "2026-11-16", "2026-11-17"];
    const report = buildCoachReport(
      growth({ habits: [habit("read")], checkins: checkins("read", days) }),
      planning(),
      toDay,
    );
    expect(report.insight).toMatchObject({
      id: "streak-at-risk:read",
      tone: "nudge",
      message: 'Your 4-day streak on "read" is still open today.',
    });
  });

  it("does not warn once it is done, and celebrates long streaks instead", () => {
    const days = Array.from({ length: 8 }, (_, i) => `2026-11-${String(11 + i).padStart(2, "0")}`);
    const report = buildCoachReport(
      growth({ habits: [habit("read")], checkins: checkins("read", days) }),
      planning(),
      toDay,
    );
    expect(ids(report)).not.toContain("streak-at-risk:read");
    expect(ids(report)).toContain("streak:read");
    expect(report.insights.find((i) => i.id === "streak:read")?.tone).toBe("celebrate");
  });

  it("flags a habit missed three or more times in a week", () => {
    const report = buildCoachReport(
      growth({ habits: [habit("run")], checkins: checkins("run", ["2026-11-12", "2026-11-17"]) }),
      planning(),
      toDay,
    );
    expect(ids(report)).toContain("slipping:run");
  });

  it("flags a times-a-week habit that can no longer be caught up comfortably", () => {
    // Needs 3 this week, none done; Wed 18 + Thu, Fri, Sat, Sun = 5 chances, so fine.
    const fine = buildCoachReport(
      growth({ habits: [habit("lift", { schedule: { type: "weekly", timesPerWeek: 3 } })] }),
      planning(),
      toDay,
    );
    expect(ids(fine)).not.toContain("weekly-behind:lift");

    // On Sunday 22 with 2 of 3 done and not done today: needs 1, 1 chance left.
    const behind = buildCoachReport(
      growth({
        today: "2026-11-22",
        habits: [habit("lift", { schedule: { type: "weekly", timesPerWeek: 3 } })],
        checkins: checkins("lift", ["2026-11-16", "2026-11-19"]),
      }),
      planning({ today: "2026-11-22" }),
      toDay,
    );
    expect(behind.insights.find((i) => i.id === "weekly-behind:lift")?.message).toContain(
      "needs 1 more this week and only 1 day remain",
    );
  });

  it("ignores archived habits", () => {
    const report = buildCoachReport(
      growth({
        habits: [habit("old", { archivedAt: "2026-11-01T00:00:00Z" })],
        checkins: checkins("old", ["2026-11-15", "2026-11-16", "2026-11-17"]),
      }),
      planning(),
      toDay,
    );
    expect(ids(report).some((id) => id.endsWith(":old"))).toBe(false);
  });
});

describe("coach: priorities", () => {
  it("nudges when nothing is chosen for today but things are being tracked", () => {
    const report = buildCoachReport(growth({ habits: [habit("read")] }), planning(), toDay);
    expect(ids(report)).toContain("no-priorities");
  });

  it("celebrates when every priority today is done", () => {
    const report = buildCoachReport(
      growth({ priorities: [priority("a", TODAY, true), priority("b", TODAY, true, 1)] }),
      planning(),
      toDay,
    );
    expect(report.insights.find((i) => i.id === "priorities-done")?.message).toBe(
      "All 2 priorities done today.",
    );
  });

  it("flags priorities left unfinished for days", () => {
    const report = buildCoachReport(
      growth({ carryOver: [priority("old", "2026-11-12")] }),
      planning(),
      toDay,
    );
    expect(ids(report)).toContain("stale-carry-over");
    expect(
      buildCoachReport(
        growth({ carryOver: [priority("new", "2026-11-17")] }),
        planning(),
        toDay,
      ).insights.map((i) => i.id),
    ).not.toContain("stale-carry-over");
  });
});

describe("coach: goals and learning", () => {
  const goal = (over = {}) => ({
    id: "g",
    title: "Run 10k",
    area: null,
    status: "active" as const,
    targetDate: null,
    completedAt: null,
    createdAt: "2026-11-01T00:00:00Z",
    milestones: [],
    ...over,
  });
  const milestone = (id: string, done: string | null) => ({
    id,
    goalId: "g",
    title: id,
    position: 0,
    completedAt: done,
  });

  it("flags overdue and soon-due goals using real milestone counts", () => {
    const overdue = buildCoachReport(
      growth(),
      planning({ goals: [goal({ targetDate: "2026-11-10", milestones: [milestone("a", null)] })] }),
      toDay,
    );
    expect(overdue.insights.find((i) => i.id === "goal-overdue:g")?.message).toBe(
      '"Run 10k" passed its target date 8 days ago with 0 of 1 milestones done.',
    );

    const soon = buildCoachReport(
      growth(),
      planning({
        goals: [
          goal({
            targetDate: "2026-11-21",
            milestones: [milestone("a", "2026-11-10T00:00:00Z"), milestone("b", null)],
          }),
        ],
      }),
      toDay,
    );
    expect(soon.insights.find((i) => i.id === "goal-soon:g")?.message).toBe(
      '"Run 10k" is due in 3 days with 1 milestone to go.',
    );
  });

  it("suggests adding milestones to a goal without any", () => {
    const report = buildCoachReport(growth(), planning({ goals: [goal()] }), toDay);
    expect(ids(report)).toContain("goal-empty:g");
  });

  it("ignores paused goals", () => {
    const report = buildCoachReport(
      growth(),
      planning({ goals: [goal({ status: "paused", targetDate: "2026-11-01" })] }),
      toDay,
    );
    expect(ids(report).some((id) => id.startsWith("goal-"))).toBe(false);
  });

  it("flags learning that has gone quiet, and celebrates a study streak", () => {
    const item = {
      id: "i",
      title: "Spanish",
      kind: "skill" as const,
      unit: "modules" as const,
      total: 20,
      completed: 3,
      createdAt: "2026-10-01T00:00:00Z",
      archivedAt: null,
    };
    const stalled = buildCoachReport(
      growth(),
      planning({
        learning: [item],
        sessions: [{ id: "s", itemId: "i", day: "2026-11-05", minutes: 20, note: null }],
      }),
      toDay,
    );
    expect(stalled.insights.find((i) => i.id === "learning-stalled:i")?.message).toBe(
      'You haven\'t studied "Spanish" for 13 days.',
    );

    const streak = buildCoachReport(
      growth(),
      planning({
        learning: [item],
        sessions: ["2026-11-16", "2026-11-17", "2026-11-18"].map((day) => ({
          id: day,
          itemId: "i",
          day,
          minutes: 20,
          note: null,
        })),
      }),
      toDay,
    );
    expect(ids(streak)).toContain("study-streak");
    expect(ids(streak)).not.toContain("learning-stalled:i");
  });
});

describe("coach: ranking and weekly review", () => {
  it("puts the most urgent insight first and caps the list", () => {
    const days = ["2026-11-14", "2026-11-15", "2026-11-16", "2026-11-17"];
    const report = buildCoachReport(
      growth({
        habits: [habit("read"), habit("a"), habit("b"), habit("c"), habit("d")],
        checkins: checkins("read", days),
        carryOver: [priority("old", "2026-11-10")],
      }),
      planning(),
      toDay,
    );
    expect(report.insight?.id).toBe("streak-at-risk:read");
    expect(report.insights.length).toBeLessThanOrEqual(6);
  });

  it("summarises the week so far from real records", () => {
    const report = buildCoachReport(
      growth({
        habits: [habit("read")],
        checkins: checkins("read", ["2026-11-16", "2026-11-17"]),
        priorities: [priority("a", "2026-11-16", true), priority("b", TODAY)],
      }),
      planning({
        sessions: [
          { id: "1", itemId: "i", day: "2026-11-17", minutes: 30, note: null },
          { id: "2", itemId: "i", day: "2026-11-15", minutes: 99, note: null },
        ],
        goals: [
          {
            id: "g",
            title: "G",
            area: null,
            status: "active",
            targetDate: null,
            completedAt: null,
            createdAt: "2026-11-01T00:00:00Z",
            milestones: [
              {
                id: "m",
                goalId: "g",
                title: "m",
                position: 0,
                completedAt: "2026-11-17T08:00:00Z",
              },
            ],
          },
        ],
      }),
      toDay,
    );
    expect(report.week).toEqual({
      priorities: { completed: 1, total: 2 },
      habitCheckins: 2,
      // Mon, Tue and Wed so far: two done, today still open.
      habitDays: { completed: 2, total: 3 },
      learningMinutes: 30,
      milestonesCompleted: 1,
    });
  });

  it("feeds the dashboard's coach insight", () => {
    const snapshot = buildDashboardSnapshot(growth(), toDay, planning());
    expect(snapshot.coachInsight?.id).toBe("get-started");
    expect(buildDashboardSnapshot(growth(), toDay, null).coachInsight).toBeNull();
  });
});

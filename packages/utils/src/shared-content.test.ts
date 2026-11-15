import { describe, expect, it } from "vitest";

import {
  coachCapabilities,
  demoDashboard,
  emptyDashboard,
  lifeAreaLabels,
  moduleCopy,
  summarizeTodayProgress,
} from "./index";

describe("shared dashboard data", () => {
  it("keeps the live dashboard honestly empty", () => {
    expect(emptyDashboard.source).toBe("live");
    expect(emptyDashboard.priorities).toHaveLength(0);
    expect(emptyDashboard.habits).toHaveLength(0);
    expect(emptyDashboard.goals).toHaveLength(0);
    expect(emptyDashboard.learning).toHaveLength(0);
    expect(emptyDashboard.weeklyActivity).toBeNull();
    expect(emptyDashboard.coachInsight).toBeNull();
  });

  it("marks sample data as demo so apps label it", () => {
    expect(demoDashboard.source).toBe("demo");
  });

  it("derives sample progress from the underlying items", () => {
    const progress = summarizeTodayProgress(demoDashboard.priorities, demoDashboard.habits);
    expect(progress.overall).toEqual({ completed: 3, total: 7 });
    expect(progress.percent).toBe(43);
  });

  it("has well-formed sample data", () => {
    expect(demoDashboard.weeklyActivity?.completions).toHaveLength(7);
    for (const habit of demoDashboard.habits) expect(habit.recentDays).toHaveLength(7);
    for (const goal of demoDashboard.goals) {
      expect(goal.milestones.completed).toBeLessThanOrEqual(goal.milestones.total);
    }
    for (const priority of demoDashboard.priorities) {
      if (priority.area) expect(lifeAreaLabels[priority.area]).toBeTruthy();
    }
  });
});

describe("module copy", () => {
  it("describes every planned module", () => {
    for (const copy of Object.values(moduleCopy)) {
      expect(copy.title).toBeTruthy();
      expect(copy.tagline).toBeTruthy();
      expect(copy.plannedCapabilities.length).toBeGreaterThan(0);
      expect(copy.dashboardNote).toMatch(/dashboard/);
    }
    expect(coachCapabilities.length).toBeGreaterThan(0);
  });
});

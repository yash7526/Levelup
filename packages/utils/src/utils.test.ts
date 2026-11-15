import type { HabitSummary, Priority } from "@levelup/types";
import { describe, expect, it } from "vitest";

import {
  formatMonthYear,
  getGreeting,
  getInitials,
  getTimeOfDay,
  getWeekdayIndex,
  getWeekdayLabels,
  normalizeDisplayName,
  pluralize,
  summarizeTodayProgress,
  toISODate,
  toPercent,
} from "./index";

const at = (hour: number) => new Date(2026, 10, 10, hour, 0, 0);

describe("time of day", () => {
  it.each([
    [5, "morning"],
    [11, "morning"],
    [12, "afternoon"],
    [16, "afternoon"],
    [17, "evening"],
    [21, "evening"],
    [22, "night"],
    [2, "night"],
  ] as const)("%i:00 is %s", (hour, expected) => {
    expect(getTimeOfDay(at(hour))).toBe(expected);
  });

  it("greets with and without a name", () => {
    expect(getGreeting(at(9), "Sam")).toBe("Good morning, Sam");
    expect(getGreeting(at(14), "  ")).toBe("Good afternoon");
    expect(getGreeting(at(23), null)).toBe("Good evening");
  });
});

describe("dates", () => {
  it("uses Monday-first weekday indexes", () => {
    expect(getWeekdayIndex(new Date(2026, 10, 9))).toBe(0); // Monday
    expect(getWeekdayIndex(new Date(2026, 10, 15))).toBe(6); // Sunday
  });

  it("formats local ISO dates without UTC drift", () => {
    expect(toISODate(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });

  it("formats calendar dates as month and year", () => {
    expect(formatMonthYear("2027-03-01", "en-GB")).toBe("Mar 2027");
  });

  it("returns seven Monday-first labels", () => {
    const labels = getWeekdayLabels("en-GB");
    expect(labels).toHaveLength(7);
    expect(labels[0]).toBe("Mon");
    expect(labels[6]).toBe("Sun");
  });
});

describe("progress", () => {
  it("never divides by zero", () => {
    expect(toPercent({ completed: 0, total: 0 })).toBe(0);
  });

  it("rounds and clamps", () => {
    expect(toPercent({ completed: 1, total: 3 })).toBe(33);
    expect(toPercent({ completed: 5, total: 4 })).toBe(100);
  });

  it("derives today's progress from priorities and habits due today", () => {
    const priorities: Priority[] = [
      { id: "p1", title: "A", status: "done", area: null },
      { id: "p2", title: "B", status: "open", area: null },
    ];
    const habit = (id: string, dueToday: boolean, completedToday: boolean): HabitSummary => ({
      id,
      name: id,
      area: null,
      dueToday,
      completedToday,
      currentStreak: 0,
      recentDays: [],
    });
    const habits = [habit("h1", true, true), habit("h2", true, false), habit("h3", false, false)];

    const progress = summarizeTodayProgress(priorities, habits);
    expect(progress.priorities).toEqual({ completed: 1, total: 2 });
    expect(progress.habits).toEqual({ completed: 1, total: 2 });
    expect(progress.overall).toEqual({ completed: 2, total: 4 });
    expect(progress.percent).toBe(50);
  });

  it("reports zero for an empty day", () => {
    expect(summarizeTodayProgress([], []).percent).toBe(0);
  });
});

describe("text", () => {
  it("normalises display names", () => {
    expect(normalizeDisplayName("  Ada   Lovelace ")).toBe("Ada Lovelace");
    expect(normalizeDisplayName("   ")).toBeNull();
    expect(normalizeDisplayName(undefined)).toBeNull();
    expect(normalizeDisplayName("a".repeat(100))).toHaveLength(40);
  });

  it("builds initials", () => {
    expect(getInitials("Ada Lovelace")).toBe("AL");
    expect(getInitials("ada")).toBe("A");
    expect(getInitials("Mary Ann Evans")).toBe("ME");
    expect(getInitials("")).toBe("");
  });

  it("pluralises", () => {
    expect(pluralize(1, "habit")).toBe("1 habit");
    expect(pluralize(2, "habit")).toBe("2 habits");
    expect(pluralize(0, "priority", "priorities")).toBe("0 priorities");
  });
});

import type { GrowthData, Habit, HabitSchedule, PriorityEntry } from "@levelup/types";
import { describe, expect, it } from "vitest";

import {
  addDays,
  buildDashboardSnapshot,
  buildWeeklyActivity,
  daysBetween,
  describeSchedule,
  describeStreak,
  firstFreePosition,
  formatISODate,
  isISODate,
  isoWeekday,
  isValidTimeZone,
  lastDays,
  localDateInTimeZone,
  parseHabitDraft,
  parseHabitSchedule,
  parseLifeArea,
  parsePriorityTitle,
  previewCheckin,
  startOfIsoWeek,
  summarizeHabit,
  summarizeHabits,
} from "./index";

// 2026-11-16 is a Monday; 2026-11-22 is the Sunday that ends that week.
const MON = "2026-11-16";

describe("calendar dates", () => {
  it("validates real YYYY-MM-DD dates only", () => {
    expect(isISODate("2026-11-15")).toBe(true);
    expect(isISODate("2028-02-29")).toBe(true);
    expect(isISODate("2026-02-29")).toBe(false);
    expect(isISODate("2026-13-01")).toBe(false);
    expect(isISODate("2026-1-01")).toBe(false);
    expect(isISODate(20261115)).toBe(false);
  });

  it("adds days across month, year and DST boundaries", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-29", 1)).toBe("2026-03-30");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
    expect(daysBetween("2026-11-10", "2026-11-15")).toBe(5);
    expect(daysBetween("2026-11-15", "2026-11-10")).toBe(-5);
  });

  it("uses ISO weekdays and Monday-start weeks", () => {
    expect(isoWeekday(MON)).toBe(1);
    expect(isoWeekday("2026-11-15")).toBe(7);
    expect(startOfIsoWeek("2026-11-15")).toBe("2026-11-09");
    expect(startOfIsoWeek(MON)).toBe(MON);
    expect(startOfIsoWeek("2026-11-22")).toBe(MON);
    expect(lastDays("2026-11-02", 3)).toEqual(["2026-10-31", "2026-11-01", "2026-11-02"]);
  });

  it("finds the calendar day in a time zone", () => {
    const instant = new Date("2026-11-15T20:00:00Z");
    expect(localDateInTimeZone(instant, "UTC")).toBe("2026-11-15");
    expect(localDateInTimeZone(instant, "Asia/Kolkata")).toBe("2026-11-16");
    expect(localDateInTimeZone(instant, "America/Los_Angeles")).toBe("2026-11-15");
    expect(localDateInTimeZone(instant, "Not/AZone")).toBe("2026-11-15");
    expect(isValidTimeZone("Europe/London")).toBe(true);
    expect(isValidTimeZone("Mars/Base")).toBe(false);
  });

  it("formats calendar dates without shifting them", () => {
    expect(
      formatISODate("2026-11-15", "en-GB", { weekday: "short", day: "numeric", month: "short" }),
    ).toBe("Sun 15 Nov");
  });
});

describe("habit schedules", () => {
  it("describes schedules in plain language", () => {
    expect(describeSchedule({ type: "daily" })).toBe("Every day");
    expect(describeSchedule({ type: "weekdays", days: [1, 2, 3, 4, 5] })).toBe("Weekdays");
    expect(describeSchedule({ type: "weekdays", days: [6, 7] })).toBe("Weekends");
    expect(describeSchedule({ type: "weekdays", days: [1, 3, 5] })).toBe("Mon, Wed, Fri");
    expect(describeSchedule({ type: "weekly", timesPerWeek: 1 })).toBe("Once a week");
    expect(describeSchedule({ type: "weekly", timesPerWeek: 2 })).toBe("Twice a week");
    expect(describeSchedule({ type: "weekly", timesPerWeek: 4 })).toBe("4 times a week");
  });

  it("parses schedule form input", () => {
    expect(parseHabitSchedule({ type: "daily" })).toEqual({ ok: true, value: { type: "daily" } });
    expect(parseHabitSchedule({ type: "weekdays", days: ["5", "1", "3", "1"] })).toEqual({
      ok: true,
      value: { type: "weekdays", days: [1, 3, 5] },
    });
    expect(parseHabitSchedule({ type: "weekdays", days: [1, 2, 3, 4, 5, 6, 7] })).toEqual({
      ok: true,
      value: { type: "daily" },
    });
    expect(parseHabitSchedule({ type: "weekdays", days: [] }).ok).toBe(false);
    expect(parseHabitSchedule({ type: "weekdays", days: ["8"] }).ok).toBe(false);
    expect(parseHabitSchedule({ type: "weekly", timesPerWeek: "3" })).toEqual({
      ok: true,
      value: { type: "weekly", timesPerWeek: 3 },
    });
    expect(parseHabitSchedule({ type: "weekly", timesPerWeek: 7 }).ok).toBe(false);
    expect(parseHabitSchedule({ type: "weekly", timesPerWeek: "1.5" }).ok).toBe(false);
    expect(parseHabitSchedule({ type: "monthly" }).ok).toBe(false);
  });
});

describe("form input", () => {
  it("normalises and limits priority titles", () => {
    expect(parsePriorityTitle("  Ship   the  draft ")).toEqual({
      ok: true,
      value: "Ship the draft",
    });
    expect(parsePriorityTitle("   ").ok).toBe(false);
    expect(parsePriorityTitle(null).ok).toBe(false);
    expect(parsePriorityTitle("x".repeat(121)).ok).toBe(false);
    expect(parsePriorityTitle("x".repeat(120)).ok).toBe(true);
  });

  it("accepts known life areas or none", () => {
    expect(parseLifeArea("")).toEqual({ ok: true, value: null });
    expect(parseLifeArea("health")).toEqual({ ok: true, value: "health" });
    expect(parseLifeArea("toString").ok).toBe(false);
  });

  it("reports every invalid habit field at once", () => {
    const result = parseHabitDraft({ name: " ", area: "nope", schedule: { type: "weekdays" } });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.error).sort()).toEqual(["area", "name", "schedule"]);
  });

  it("finds the first free priority slot", () => {
    expect(firstFreePosition([])).toBe(0);
    expect(firstFreePosition([0, 2])).toBe(1);
    expect(firstFreePosition([0, 1, 2])).toBeNull();
  });
});

const habitWith = (schedule: HabitSchedule) => ({
  id: "h",
  name: "Habit",
  area: null,
  schedule,
});

function summarize(schedule: HabitSchedule, days: string[], today: string, startDay: string) {
  return summarizeHabit({
    habit: habitWith(schedule),
    checkinDays: new Set(days),
    today,
    startDay,
  });
}

describe("daily habit streaks", () => {
  it("counts consecutive days including today once done", () => {
    const summary = summarize(
      { type: "daily" },
      ["2026-11-14", "2026-11-15"],
      "2026-11-15",
      "2026-11-01",
    );
    expect(summary.currentStreak).toBe(2);
    expect(summary.completedToday).toBe(true);
    expect(summary.dueToday).toBe(true);
    expect(describeStreak(summary)).toBe("2-day streak");
  });

  it("keeps yesterday's streak while today is still open", () => {
    const summary = summarize(
      { type: "daily" },
      ["2026-11-13", "2026-11-14"],
      "2026-11-15",
      "2026-11-01",
    );
    expect(summary.currentStreak).toBe(2);
    expect(summary.recentDays).toEqual([
      "missed",
      "missed",
      "missed",
      "missed",
      "done",
      "done",
      "open",
    ]);
  });

  it("breaks on a missed day and never counts days before the habit existed", () => {
    expect(
      summarize({ type: "daily" }, ["2026-11-12", "2026-11-14"], "2026-11-15", "2026-11-01")
        .currentStreak,
    ).toBe(1);
    const fresh = summarize({ type: "daily" }, [], "2026-11-15", "2026-11-14");
    expect(fresh.currentStreak).toBe(0);
    expect(describeStreak(fresh)).toBe("No streak yet");
    expect(fresh.recentDays).toEqual(["off", "off", "off", "off", "off", "missed", "open"]);
  });
});

describe("specific-day habit streaks", () => {
  // Mon, Wed, Fri.
  const schedule: HabitSchedule = { type: "weekdays", days: [1, 3, 5] };

  it("skips unscheduled days", () => {
    // Fri 13 and Wed 11 done; Sat 14 and Sun 15 are rest days.
    const summary = summarize(schedule, ["2026-11-11", "2026-11-13"], "2026-11-15", "2026-11-01");
    expect(summary.dueToday).toBe(false);
    expect(summary.currentStreak).toBe(2);
    expect(summary.recentDays).toEqual(["missed", "off", "done", "off", "done", "off", "off"]);
  });

  it("ignores check-ins on rest days for the streak", () => {
    const summary = summarize(schedule, ["2026-11-13", "2026-11-15"], "2026-11-15", "2026-11-01");
    expect(summary.completedToday).toBe(true);
    expect(summary.dueToday).toBe(false);
    expect(summary.currentStreak).toBe(1);
  });
});

describe("times-per-week habit streaks", () => {
  const schedule: HabitSchedule = { type: "weekly", timesPerWeek: 2 };

  it("counts weeks that met the target and tracks this week", () => {
    const days = ["2026-11-03", "2026-11-05", "2026-11-10", "2026-11-12", "2026-11-16"];
    const summary = summarize(schedule, days, "2026-11-17", "2026-11-01");
    expect(summary.streakUnit).toBe("week");
    expect(summary.weekProgress).toEqual({ completed: 1, total: 2 });
    expect(summary.dueToday).toBe(true);
    // This week (1 of 2) doesn't count yet; the two previous weeks do.
    expect(summary.currentStreak).toBe(2);
    expect(describeStreak(summary)).toBe("2-week streak");
  });

  it("is no longer due once the week's target is met, unless done today", () => {
    const met = summarize(schedule, [MON, "2026-11-17"], "2026-11-18", MON);
    expect(met.dueToday).toBe(false);
    expect(met.currentStreak).toBe(1);
    expect(met.recentDays.at(-1)).toBe("off");
    const doneToday = summarize(schedule, [MON, "2026-11-18"], "2026-11-18", MON);
    expect(doneToday.dueToday).toBe(true);
  });
});

describe("live overview", () => {
  const habit = (id: string, schedule: HabitSchedule, archivedAt: string | null = null): Habit => ({
    id,
    name: id,
    area: null,
    schedule,
    createdAt: "2026-11-01T09:00:00Z",
    archivedAt,
  });
  const priority = (id: string, day: string, position: number, done: boolean): PriorityEntry => ({
    id,
    title: id,
    area: null,
    day,
    position,
    status: done ? "done" : "open",
    completedAt: done ? `${day}T12:00:00Z` : null,
  });

  it("counts completions per weekday this week", () => {
    expect(
      buildWeeklyActivity("2026-11-18", [MON, MON, "2026-11-18", "2026-11-15"]).completions,
    ).toEqual([2, 0, 1, 0, 0, 0, 0]);
  });

  it("builds the dashboard from real priorities and habits", () => {
    const data: GrowthData = {
      today: "2026-11-17",
      habits: [
        habit("read", { type: "daily" }),
        habit("old", { type: "daily" }, "2026-11-10T00:00:00Z"),
      ],
      checkins: [
        { id: "c1", habitId: "read", day: MON },
        { id: "c2", habitId: "old", day: MON },
      ],
      priorities: [
        priority("b", "2026-11-17", 1, false),
        priority("a", "2026-11-17", 0, true),
        priority("m", MON, 0, true),
      ],
      carryOver: [],
    };
    const snapshot = buildDashboardSnapshot(data, (instant) => instant.slice(0, 10));
    expect(snapshot.source).toBe("live");
    expect(snapshot.priorities.map((p) => p.id)).toEqual(["a", "b"]);
    expect(snapshot.habits.map((h) => h.id)).toEqual(["read"]);
    expect(snapshot.habits[0]?.currentStreak).toBe(1);
    expect(snapshot.weeklyActivity?.completions).toEqual([3, 1, 0, 0, 0, 0, 0]);
    expect(snapshot.goals).toEqual([]);
    // The coach reads the same data: this habit was missed on most days this week.
    expect(snapshot.coachInsight?.id).toBe("slipping:read");
  });

  it("shows no weekly activity when nothing is tracked yet", () => {
    const empty: GrowthData = {
      today: MON,
      habits: [],
      checkins: [],
      priorities: [],
      carryOver: [],
    };
    expect(
      buildDashboardSnapshot(empty, (instant) => instant.slice(0, 10)).weeklyActivity,
    ).toBeNull();
  });

  it("summarises habits in the order given", () => {
    const summaries = summarizeHabits(
      [habit("b", { type: "daily" }), habit("a", { type: "daily" })],
      [],
      MON,
      (instant) => instant.slice(0, 10),
    );
    expect(summaries.map((s) => s.id)).toEqual(["b", "a"]);
  });
});

describe("check-in previews", () => {
  it("marks a past day done and back to missed", () => {
    const summary = summarize({ type: "daily" }, [], "2026-11-15", "2026-11-01");
    const done = previewCheckin(summary, {
      day: "2026-11-13",
      done: true,
      today: "2026-11-15",
      start: "2026-11-01",
    });
    expect(done.recentDays).toEqual([
      "missed",
      "missed",
      "missed",
      "missed",
      "done",
      "missed",
      "open",
    ]);
    const undone = previewCheckin(done, {
      day: "2026-11-13",
      done: false,
      today: "2026-11-15",
      start: "2026-11-01",
    });
    expect(undone.recentDays).toEqual(summary.recentDays);
  });

  it("updates today's state and weekly progress", () => {
    const schedule: HabitSchedule = { type: "weekly", timesPerWeek: 2 };
    const summary = summarize(schedule, [MON], "2026-11-17", MON);
    const done = previewCheckin(summary, {
      day: "2026-11-17",
      done: true,
      today: "2026-11-17",
      start: MON,
    });
    expect(done.completedToday).toBe(true);
    expect(done.weekProgress).toEqual({ completed: 2, total: 2 });
    expect(done.recentDays.at(-1)).toBe("done");
    // Undoing today with the target unmet makes it due again.
    const undone = previewCheckin(done, {
      day: "2026-11-17",
      done: false,
      today: "2026-11-17",
      start: MON,
    });
    expect(undone.dueToday).toBe(true);
    expect(undone.recentDays.at(-1)).toBe("open");
  });

  it("ignores no-op changes and days outside the window", () => {
    const summary = summarize({ type: "daily" }, ["2026-11-15"], "2026-11-15", "2026-11-01");
    expect(
      previewCheckin(summary, {
        day: "2026-11-15",
        done: true,
        today: "2026-11-15",
        start: "2026-11-01",
      }),
    ).toBe(summary);
    expect(
      previewCheckin(summary, {
        day: "2026-10-01",
        done: true,
        today: "2026-11-15",
        start: "2026-11-01",
      }),
    ).toBe(summary);
  });
});

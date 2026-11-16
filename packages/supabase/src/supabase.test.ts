import { describe, expect, it } from "vitest";

import {
  describeDataError,
  describeSupabaseProject,
  LevelUpDataError,
  mapGoalRow,
  mapHabitRow,
  mapLearningItemRow,
  mapLearningSessionRow,
  mapMilestoneRow,
  mapPriorityRow,
  mapProfileRow,
  parseSupabaseConfig,
} from "./index";

describe("parseSupabaseConfig", () => {
  it("returns null when settings are missing", () => {
    expect(parseSupabaseConfig({})).toBeNull();
    expect(parseSupabaseConfig({ url: "https://x.supabase.co" })).toBeNull();
    expect(parseSupabaseConfig({ url: "  ", publishableKey: "key" })).toBeNull();
  });

  it("rejects malformed URLs", () => {
    expect(parseSupabaseConfig({ url: "not a url", publishableKey: "key" })).toBeNull();
    expect(parseSupabaseConfig({ url: "ftp://x.supabase.co", publishableKey: "key" })).toBeNull();
  });

  it("normalises valid settings", () => {
    const config = parseSupabaseConfig({
      url: " https://abcd.supabase.co/ ",
      publishableKey: " sb_publishable_123 ",
    });
    expect(config).toEqual({
      url: "https://abcd.supabase.co",
      publishableKey: "sb_publishable_123",
    });
    expect(config && describeSupabaseProject(config)).toBe("abcd.supabase.co");
  });
});

describe("mapProfileRow", () => {
  it("converts snake_case rows to the shared UserProfile type", () => {
    expect(
      mapProfileRow({
        id: "u1",
        display_name: "Sam",
        avatar_url: null,
        timezone: "Europe/London",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-02T00:00:00Z",
      }),
    ).toEqual({
      id: "u1",
      displayName: "Sam",
      avatarUrl: null,
      timezone: "Europe/London",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-02T00:00:00Z",
    });
  });
});

describe("Today & Habits rows", () => {
  it("maps priority rows and ignores unknown areas", () => {
    expect(
      mapPriorityRow({
        id: "p1",
        day: "2026-11-15",
        position: 1,
        title: "Ship",
        area: "astrology",
        status: "done",
        completed_at: "2026-11-15T10:00:00Z",
      }),
    ).toEqual({
      id: "p1",
      day: "2026-11-15",
      position: 1,
      title: "Ship",
      area: null,
      status: "done",
      completedAt: "2026-11-15T10:00:00Z",
    });
  });

  it("maps every habit schedule, falling back to daily for malformed rows", () => {
    const row = {
      id: "h1",
      name: "Run",
      area: "health",
      schedule_type: "daily",
      schedule_days: null,
      weekly_target: null,
      created_at: "2026-11-01T00:00:00Z",
      archived_at: null,
    };
    expect(mapHabitRow(row).schedule).toEqual({ type: "daily" });
    expect(
      mapHabitRow({ ...row, schedule_type: "weekdays", schedule_days: [5, 1, 3, 9] }).schedule,
    ).toEqual({ type: "weekdays", days: [1, 3, 5] });
    expect(mapHabitRow({ ...row, schedule_type: "weekly", weekly_target: 3 }).schedule).toEqual({
      type: "weekly",
      timesPerWeek: 3,
    });
    expect(mapHabitRow({ ...row, schedule_type: "weekdays", schedule_days: [] }).schedule).toEqual({
      type: "daily",
    });
    expect(mapHabitRow(row).area).toBe("health");
  });

  it("explains data errors without leaking internals", () => {
    const fallback = "Please try again.";
    expect(describeDataError(new LevelUpDataError("limit_reached", "Day is full."), fallback)).toBe(
      "Day is full.",
    );
    expect(describeDataError(new LevelUpDataError("failed", "SQL: boom"), fallback)).toBe(fallback);
    expect(describeDataError(new Error("network"), fallback)).toBe(fallback);
  });
});

describe("Goals & Learning rows", () => {
  it("maps goals with milestones in order and tolerates unknown values", () => {
    const goal = mapGoalRow(
      {
        id: "g1",
        title: "Run 10k",
        area: "unknown",
        status: "weird",
        target_date: "2027-01-01",
        completed_at: null,
        created_at: "2026-11-01T00:00:00Z",
      },
      [
        mapMilestoneRow({
          id: "m2",
          goal_id: "g1",
          title: "Second",
          position: 1,
          completed_at: null,
        }),
        mapMilestoneRow({
          id: "m1",
          goal_id: "g1",
          title: "First",
          position: 0,
          completed_at: "2026-11-05T00:00:00Z",
        }),
      ],
    );
    expect(goal.status).toBe("active");
    expect(goal.area).toBeNull();
    expect(goal.milestones.map((m) => m.id)).toEqual(["m1", "m2"]);
    expect(goal.milestones[0]?.completedAt).toBe("2026-11-05T00:00:00Z");
  });

  it("maps learning items and clamps progress to the total", () => {
    const item = mapLearningItemRow({
      id: "i1",
      title: "Book",
      kind: "book",
      unit: "pages",
      total: 300,
      completed: 999,
      created_at: "2026-11-01T00:00:00Z",
      archived_at: null,
    });
    expect(item).toMatchObject({ kind: "book", unit: "pages", total: 300, completed: 300 });
    expect(
      mapLearningSessionRow({ id: "s", item_id: "i1", day: "2026-11-16", minutes: 25, note: null }),
    ).toEqual({ id: "s", itemId: "i1", day: "2026-11-16", minutes: 25, note: null });
  });
});

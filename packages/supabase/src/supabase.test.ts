import { describe, expect, it } from "vitest";

import { describeSupabaseProject, mapProfileRow, parseSupabaseConfig } from "./index";

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

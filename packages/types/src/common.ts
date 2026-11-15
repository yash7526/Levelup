/** Calendar date in `YYYY-MM-DD` form, interpreted in the user's local time zone. */
export type ISODateString = string;

/** Full ISO-8601 timestamp, e.g. `2026-11-10T08:30:00.000Z`. */
export type ISODateTimeString = string;

/** Opaque identifier (UUID from Supabase). */
export type Id = string;

/** Where a piece of data came from. Demo data must always be labelled in the UI. */
export type DataSource = "live" | "demo";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export interface Fraction {
  completed: number;
  total: number;
}

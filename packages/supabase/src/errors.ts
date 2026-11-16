/**
 * - `limit_reached`: e.g. a day already has three priorities;
 * - `not_found`: the row doesn't exist or belongs to someone else (row-level security);
 * - `conflict`: a concurrent change won; retrying usually works;
 * - `setup_required`: the database is missing tables (a migration hasn't been run);
 * - `failed`: anything else (network, permissions, schema not migrated…).
 */
export type DataErrorCode =
  "limit_reached" | "not_found" | "conflict" | "setup_required" | "failed";

/** A data operation that failed in a way the UI can explain. */
export class LevelUpDataError extends Error {
  readonly code: DataErrorCode;

  constructor(code: DataErrorCode, message: string) {
    super(message);
    this.name = "LevelUpDataError";
    this.code = code;
  }
}

export function isDataError(error: unknown, code?: DataErrorCode): error is LevelUpDataError {
  return error instanceof LevelUpDataError && (code === undefined || error.code === code);
}

/** Postgres error codes surfaced by PostgREST. */
export const PG_UNIQUE_VIOLATION = "23505";
export const PG_FOREIGN_KEY_VIOLATION = "23503";
/** "relation does not exist" (Postgres) and "table not in schema cache" (PostgREST). */
const MISSING_TABLE_CODES = new Set(["42P01", "PGRST205"]);

interface PostgrestErrorLike {
  message: string;
  code?: string;
}

/** Throws a `failed` (or `not_found` for a dangling reference) error for a query error. */
export function throwQueryError(action: string, error: PostgrestErrorLike): never {
  if (error.code && MISSING_TABLE_CODES.has(error.code)) {
    throw new LevelUpDataError(
      "setup_required",
      "LevelUp's database isn't fully set up yet. Run the latest Supabase migrations (see the README).",
    );
  }
  if (error.code === PG_FOREIGN_KEY_VIOLATION) {
    throw new LevelUpDataError("not_found", `Failed to ${action}: it no longer exists.`);
  }
  throw new LevelUpDataError("failed", `Failed to ${action}: ${error.message}`);
}

/** A message people can act on for a failed save, without leaking internals. */
export function describeDataError(error: unknown, fallback: string): string {
  if (
    isDataError(error, "limit_reached") ||
    isDataError(error, "conflict") ||
    isDataError(error, "setup_required")
  ) {
    return error.message;
  }
  if (isDataError(error, "not_found"))
    return "That item no longer exists. Refresh to see the latest.";
  return fallback;
}

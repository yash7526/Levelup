import { describeDataError } from "@levelup/supabase";

/** What a Today/Habits server action reports back to the client. */
export type ActionResult = { ok: true } | { ok: false; error: string };

export const SESSION_EXPIRED = "Your session has expired. Please sign in again.";

/** A message people can act on, without leaking internals. */
export const describeActionError = describeDataError;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Ids arrive from the client, so check their shape before they reach a query. */
export function isId(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

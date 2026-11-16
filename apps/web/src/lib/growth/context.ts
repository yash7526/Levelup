import "server-only";

import { describeDataError, type LevelUpSupabaseClient, loadGrowthData } from "@levelup/supabase";
import type { GrowthData, ISODateString } from "@levelup/types";
import { isValidTimeZone, localDateInTimeZone } from "@levelup/utils";
import { cookies } from "next/headers";
import { cache } from "react";

import { TIME_ZONE_COOKIE } from "@/lib/preferences";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface GrowthContext {
  supabase: LevelUpSupabaseClient;
  userId: string;
  /** The viewer's IANA time zone (UTC until the browser has reported it). */
  timeZone: string;
  /** The viewer's current calendar day. */
  today: ISODateString;
  /** Converts a timestamp to the viewer's calendar day. */
  toLocalDay: (instant: string) => ISODateString;
}

async function readTimeZone(): Promise<string> {
  const value = (await cookies()).get(TIME_ZONE_COOKIE)?.value;
  return value && isValidTimeZone(value) ? value : "UTC";
}

/**
 * The signed-in viewer's Supabase client, id and calendar day, or `null` when accounts
 * aren't configured or nobody is signed in. Deduplicated per request.
 */
export const getGrowthContext = cache(async (): Promise<GrowthContext | null> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) return null;

  const timeZone = await readTimeZone();
  return {
    supabase,
    userId,
    timeZone,
    today: localDateInTimeZone(new Date(), timeZone),
    toLocalDay: (instant) => localDateInTimeZone(new Date(instant), timeZone),
  };
});

export type GrowthLoad = { ok: true; data: GrowthData } | { ok: false; message: string };

/**
 * The viewer's Today and Habits data (deduplicated per request). A failure becomes a
 * message the page can show, rather than an error page.
 */
export const getGrowthData = cache(async (context: GrowthContext): Promise<GrowthLoad> => {
  try {
    return { ok: true, data: await loadGrowthData(context.supabase, context.today) };
  } catch (error) {
    console.error("[growth] Failed to load Today and Habits data", error);
    return {
      ok: false,
      message: describeDataError(
        error,
        "We couldn't load your priorities and habits. Check your connection and try again.",
      ),
    };
  }
});

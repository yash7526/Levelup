import "server-only";

import { fetchProfile } from "@levelup/supabase";
import type { Viewer } from "@levelup/types";
import { normalizeDisplayName } from "@levelup/utils";
import { cookies } from "next/headers";
import { cache } from "react";

import { PREFERRED_NAME_COOKIE } from "./preferences";
import { createSupabaseServerClient } from "./supabase/server";

/**
 * Resolves who is using the app for this request (deduplicated per render).
 *
 * - Signed in with Supabase → name from `public.profiles`, falling back to the local name.
 * - Otherwise → the preferred name saved on this device in Settings, if any.
 */
export const getViewer = cache(async (): Promise<Viewer> => {
  const cookieStore = await cookies();
  const localName = normalizeDisplayName(cookieStore.get(PREFERRED_NAME_COOKIE)?.value);

  const supabase = await createSupabaseServerClient();
  if (supabase) {
    try {
      const { data } = await supabase.auth.getClaims();
      const userId = data?.claims.sub;
      if (userId) {
        const profile = await fetchProfile(supabase, userId);
        return {
          isAuthenticated: true,
          displayName: normalizeDisplayName(profile?.displayName) ?? localName,
        };
      }
    } catch (error) {
      // A Supabase outage must never take the app down; fall back to local data.
      console.error("[viewer] Failed to resolve Supabase session", error);
    }
  }

  return { isAuthenticated: false, displayName: localName };
});

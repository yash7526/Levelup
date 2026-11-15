import "server-only";

import { fetchProfile } from "@levelup/supabase";
import type { Viewer } from "@levelup/types";
import { normalizeDisplayName } from "@levelup/utils";
import { cookies } from "next/headers";
import { cache } from "react";

import { PREFERRED_NAME_COOKIE } from "./preferences";
import { getSupabaseConfig } from "./supabase/config";
import { createSupabaseServerClient } from "./supabase/server";

/** Accounts are on whenever Supabase is configured; otherwise the app runs without them. */
export function isAuthEnabled(): boolean {
  return getSupabaseConfig() !== null;
}

/**
 * Resolves who is using the app for this request (deduplicated per render).
 *
 * - Accounts enabled → the signed-in user (name from `public.profiles`, falling back to the
 *   name given at sign-up), or a signed-out viewer.
 * - Accounts disabled (no Supabase) → a local viewer named in Settings on this device.
 */
export const getViewer = cache(async (): Promise<Viewer> => {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    const cookieStore = await cookies();
    return {
      isAuthenticated: false,
      email: null,
      displayName: normalizeDisplayName(cookieStore.get(PREFERRED_NAME_COOKIE)?.value),
    };
  }

  try {
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;
    if (claims?.sub) {
      const profile = await fetchProfile(supabase, claims.sub);
      const signUpName =
        typeof claims.user_metadata?.display_name === "string"
          ? claims.user_metadata.display_name
          : null;
      return {
        isAuthenticated: true,
        email: typeof claims.email === "string" ? claims.email : null,
        displayName: normalizeDisplayName(profile?.displayName ?? signUpName),
      };
    }
  } catch (error) {
    // A Supabase outage must not crash rendering; the viewer is treated as signed out.
    console.error("[viewer] Failed to resolve Supabase session", error);
  }

  return { isAuthenticated: false, email: null, displayName: null };
});

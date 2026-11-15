import "server-only";

import type { Database, LevelUpSupabaseClient } from "@levelup/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseConfig } from "./config";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Create one per request. Returns `null` when Supabase is not configured.
 */
export async function createSupabaseServerClient(): Promise<LevelUpSupabaseClient | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot set cookies. Safe to ignore: the proxy
          // (src/proxy.ts) refreshes sessions before rendering.
        }
      },
    },
  });
}

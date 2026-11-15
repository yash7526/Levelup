import type { Database, LevelUpSupabaseClient } from "@levelup/supabase";
import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "./config";

let browserClient: LevelUpSupabaseClient | undefined;

/**
 * Supabase client for Client Components. Sessions live in cookies shared with the
 * server (via `@supabase/ssr`). Returns `null` when Supabase is not configured.
 */
export function getSupabaseBrowserClient(): LevelUpSupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) return null;
  browserClient ??= createBrowserClient<Database>(config.url, config.publishableKey);
  return browserClient;
}

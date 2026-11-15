import { parseSupabaseConfig, type SupabaseConfig } from "@levelup/supabase";

/**
 * Reads Supabase settings from the environment. Returns `null` when Supabase is not
 * configured, in which case every Supabase-backed feature degrades to its empty state.
 */
export function getSupabaseConfig(): SupabaseConfig | null {
  return parseSupabaseConfig({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

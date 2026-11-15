import {
  createClient,
  type SupabaseClient,
  type SupabaseClientOptions,
} from "@supabase/supabase-js";

import type { SupabaseConfig } from "./config";
import type { Database } from "./database.types";

export type LevelUpSupabaseClient = SupabaseClient<Database>;

/**
 * Platform-agnostic client factory. The web app uses `@supabase/ssr` for cookie-based
 * sessions instead; this factory is intended for the Expo app (pass an AsyncStorage
 * or SecureStore adapter via `options.auth.storage`) and for scripts.
 */
export function createLevelUpClient(
  config: SupabaseConfig,
  options?: SupabaseClientOptions<"public">,
): LevelUpSupabaseClient {
  return createClient<Database>(config.url, config.publishableKey, options);
}

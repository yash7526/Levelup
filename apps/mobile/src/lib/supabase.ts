import "react-native-url-polyfill/auto";

import { createLevelUpClient, parseSupabaseConfig } from "@levelup/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, Platform } from "react-native";

import { env } from "./env";

/** `null` when Supabase isn't configured; features then fall back to empty states. */
export const supabaseConfig = parseSupabaseConfig({
  url: env.supabaseUrl,
  publishableKey: env.supabasePublishableKey,
});

export const supabase = supabaseConfig
  ? createLevelUpClient(supabaseConfig, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// Refresh the session only while the app is in the foreground (Supabase's guidance
// for React Native: background timers are unreliable on mobile).
if (supabase && Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") void supabase.auth.startAutoRefresh();
    else void supabase.auth.stopAutoRefresh();
  });
}

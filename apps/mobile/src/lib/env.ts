/**
 * Public build-time configuration. `process.env.EXPO_PUBLIC_*` must be referenced
 * literally so Expo can inline the values into the bundle.
 */
export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
};

/**
 * Whether the dashboard may offer a clearly labelled sample-data preview.
 * Defaults to on in development builds and off in release builds.
 */
export function isDemoDataEnabled(): boolean {
  const flag = process.env.EXPO_PUBLIC_ENABLE_DEMO_DATA;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return __DEV__;
}

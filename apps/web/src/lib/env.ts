/**
 * Public, non-secret configuration. `process.env.NEXT_PUBLIC_*` must be referenced
 * literally so Next.js can inline the values into client bundles.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Whether the dashboard may offer a clearly labelled sample-data preview.
 * Defaults to on in development and off in production.
 */
export function isDemoDataEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_ENABLE_DEMO_DATA;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV !== "production";
}

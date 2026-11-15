/** Pages for signed-out visitors. Signed-in users are sent to the dashboard instead. */
export const AUTH_ROUTES = [
  "/sign-in",
  "/sign-up",
  "/verify",
  "/forgot-password",
  "/reset-password",
] as const;

export const SIGNED_IN_HOME = "/dashboard";
export const SIGN_IN_PATH = "/sign-in";

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Validates a post-sign-in destination taken from the URL. Only same-site, absolute
 * paths are allowed, which prevents open redirects such as `?next=//evil.example`.
 */
export function safeNextPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0 || value.length > 512) return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  const pathname = value.split(/[?#]/)[0] ?? "/";
  if (isAuthRoute(pathname)) return null;
  return value;
}

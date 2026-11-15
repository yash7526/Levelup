import type { Database } from "@levelup/supabase";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { isAuthRoute, SIGN_IN_PATH, SIGNED_IN_HOME } from "@/lib/auth/routes";

import { getSupabaseConfig } from "./config";

/**
 * Runs on every matched request:
 * 1. Refreshes the Supabase session and forwards updated cookies to the render and browser.
 * 2. Optimistically redirects: signed-out visitors to sign-in, signed-in users away from
 *    the sign-in pages. (The app layout re-checks on the server, and row-level security
 *    protects the data itself — this is only the fast first line.)
 *
 * No-op when Supabase is not configured: the app then runs without accounts.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const config = getSupabaseConfig();
  if (!config) return response;

  const supabase = createServerClient<Database>(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Responses that set auth cookies must never be cached by a CDN.
        for (const [key, value] of Object.entries(headers)) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // Do not add logic between creating the client and this call: it validates the
  // JWT and triggers a token refresh when needed.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims.sub);

  const { pathname, search } = request.nextUrl;
  const onAuthPage = isAuthRoute(pathname);

  if (!signedIn && !onAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = SIGN_IN_PATH;
    url.search = "";
    if (pathname !== "/" && pathname !== SIGNED_IN_HOME) {
      url.searchParams.set("next", `${pathname}${search}`);
    }
    return redirectWithSession(url, response);
  }

  if (signedIn && onAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = SIGNED_IN_HOME;
    url.search = "";
    return redirectWithSession(url, response);
  }

  return response;
}

/** A redirect that keeps any refreshed session cookies and no-cache headers. */
function redirectWithSession(url: URL, sessionResponse: NextResponse): NextResponse {
  const redirect = NextResponse.redirect(url);
  for (const cookie of sessionResponse.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  const cacheControl = sessionResponse.headers.get("Cache-Control");
  if (cacheControl) redirect.headers.set("Cache-Control", cacheControl);
  return redirect;
}

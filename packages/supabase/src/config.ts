export interface SupabaseConfig {
  url: string;
  /** Publishable (formerly "anon") key. Safe to ship to browsers and apps; RLS protects data. */
  publishableKey: string;
}

export interface SupabaseConfigInput {
  url?: string | null;
  publishableKey?: string | null;
}

/**
 * `http(s)://host[:port][/path]`. Validated with a pattern rather than the `URL` global
 * so this package stays free of DOM/Node runtime assumptions (React Native included).
 */
const SUPABASE_URL_PATTERN = /^https?:\/\/([a-z0-9.-]+(?::\d+)?)(\/[^\s]*)?$/i;

/**
 * Validates Supabase settings. Returns `null` when they are missing or malformed so
 * callers can run without a backend (local UI work, previews, CI builds).
 */
export function parseSupabaseConfig(input: SupabaseConfigInput): SupabaseConfig | null {
  const url = input.url?.trim();
  const publishableKey = input.publishableKey?.trim();
  if (!url || !publishableKey) return null;
  if (!SUPABASE_URL_PATTERN.test(url)) return null;

  return { url: url.replace(/\/+$/, ""), publishableKey };
}

/** Human-readable project host, e.g. `abcd1234.supabase.co`. */
export function describeSupabaseProject(config: SupabaseConfig): string {
  return SUPABASE_URL_PATTERN.exec(config.url)?.[1] ?? config.url;
}

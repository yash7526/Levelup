export const DISPLAY_NAME_MAX_LENGTH = 40;

/**
 * Normalises a user-entered display name: trims, collapses whitespace and strips
 * control characters. Returns `null` for empty input.
 */
export function normalizeDisplayName(
  input: string | null | undefined,
  maxLength: number = DISPLAY_NAME_MAX_LENGTH,
): string | null {
  if (!input) return null;
  const cleaned = input
    // eslint-disable-next-line no-control-regex -- intentionally strips control characters
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return null;
  return Array.from(cleaned).slice(0, maxLength).join("");
}

/** Up to two initials, e.g. "Ada Lovelace" → "AL". */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (!first) return "";
  const last = parts.length > 1 ? parts[parts.length - 1] : undefined;
  const initials = [first, last]
    .filter((part): part is string => Boolean(part))
    .map((part) => Array.from(part)[0] ?? "")
    .join("");
  return initials.toLocaleUpperCase();
}

/** `pluralize(1, "habit")` → "1 habit", `pluralize(3, "habit")` → "3 habits". */
export function pluralize(
  count: number,
  singular: string,
  plural: string = `${singular}s`,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

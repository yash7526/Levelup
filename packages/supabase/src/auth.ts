/**
 * Platform-agnostic account helpers shared by the web and mobile apps:
 * input validation and friendly copy for Supabase Auth errors.
 */

/** Minimum password length enforced by the apps (Supabase's own default is 6). */
export const PASSWORD_MIN_LENGTH = 8;
/** bcrypt, which Supabase uses for passwords, only considers the first 72 bytes. */
export const PASSWORD_MAX_LENGTH = 72;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Supabase email OTP length is configurable between 6 and 10 digits. */
const OTP_PATTERN = /^\d{6,10}$/;

export interface AuthFieldErrors {
  name?: string;
  email?: string;
  password?: string;
  code?: string;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Strips spaces and dashes people type or paste into one-time codes. */
export function normalizeOtp(code: string): string {
  return code.replace(/[\s-]/g, "");
}

export function validateEmail(email: string): string | undefined {
  const value = normalizeEmail(email);
  if (!value) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(value)) return "Enter a valid email address, like name@example.com.";
  return undefined;
}

/** UTF-8 byte length, computed without runtime-specific APIs like TextEncoder. */
function utf8Length(text: string): number {
  let bytes = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
  }
  return bytes;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return "Enter a password.";
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (utf8Length(password) > PASSWORD_MAX_LENGTH) {
    return `Use at most ${PASSWORD_MAX_LENGTH} characters.`;
  }
  return undefined;
}

export function validateOtp(code: string): string | undefined {
  const value = normalizeOtp(code);
  if (!value) return "Enter the code from your email.";
  if (!OTP_PATTERN.test(value)) return "Enter the 6-digit code from your email.";
  return undefined;
}

/** The parts of a Supabase `AuthError` (or a network failure) the apps react to. */
export interface AuthErrorLike {
  code?: string;
  status?: number;
  message?: string;
  name?: string;
}

const messages: Record<string, string> = {
  invalid_credentials: "That email and password don't match. Check them and try again.",
  email_not_confirmed: "Confirm your email first — enter the code we sent you.",
  user_already_exists: "An account with this email already exists. Sign in instead.",
  email_exists: "An account with this email already exists. Sign in instead.",
  weak_password: "That password is too easy to guess. Try a longer one.",
  same_password: "Choose a password that's different from your current one.",
  otp_expired: "That code is incorrect or has expired. Request a new one and try again.",
  otp_disabled: "Email codes aren't enabled for this project yet.",
  over_email_send_rate_limit:
    "Too many emails sent. Please wait a few minutes before trying again.",
  over_request_rate_limit: "Too many attempts. Please wait a minute and try again.",
  signup_disabled: "New sign-ups are currently closed.",
  email_address_invalid: "That email address can't receive mail. Check it and try again.",
  user_not_found: "We couldn't find an account with that email.",
  session_not_found: "Your session has expired. Please sign in again.",
};

/** Turns any Supabase Auth error into a short, human sentence safe to show users. */
export function describeAuthError(error: AuthErrorLike | null | undefined): string {
  if (!error) return "Something went wrong. Please try again.";
  if (error.code && messages[error.code]) return messages[error.code] as string;
  if (error.status === 429) return messages.over_request_rate_limit as string;
  const text = `${error.name ?? ""} ${error.message ?? ""}`.toLowerCase();
  if (error.status === 0 || /fetch failed|network|failed to fetch|timeout/.test(text)) {
    return "Can't reach LevelUp's servers. Check your internet connection and try again.";
  }
  return "Something went wrong. Please try again.";
}

/**
 * With email confirmation on, Supabase deliberately returns a "user" with no identities
 * (instead of an error) when signing up with an email that already has an account, so
 * attackers can't discover which emails are registered. The apps show that case as
 * "already registered" on the device that tried to sign up.
 */
export function isExistingAccountSignUp(
  user: { identities?: unknown[] | null } | null | undefined,
): boolean {
  return Boolean(user && Array.isArray(user.identities) && user.identities.length === 0);
}

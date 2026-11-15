"use server";

import {
  type AuthFieldErrors,
  describeAuthError,
  isExistingAccountSignUp,
  normalizeEmail,
  normalizeOtp,
  validateEmail,
  validateOtp,
  validatePassword,
} from "@levelup/supabase";
import { DISPLAY_NAME_MAX_LENGTH, normalizeDisplayName } from "@levelup/utils";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { safeNextPath, SIGN_IN_PATH, SIGNED_IN_HOME } from "@/lib/auth/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthFormState {
  /** Form-level error, shown above the fields. */
  error?: string;
  /** Neutral confirmation, e.g. "We've sent a new code". */
  notice?: string;
  fieldErrors?: AuthFieldErrors;
  /** Echoed back so fields keep what was typed (never includes passwords). */
  values?: { name?: string; email?: string };
}

const NOT_CONFIGURED: AuthFormState = {
  error: "Accounts aren't set up in this environment yet.",
};

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function hasErrors(errors: AuthFieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

/** Builds e.g. `/verify?email=…`. Cast: typed routes can't check runtime-built URLs. */
function withEmail(path: "/verify" | "/reset-password", email: string, extra = ""): Route {
  return `${path}?email=${encodeURIComponent(email)}${extra}` as Route;
}

export async function signIn(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = normalizeEmail(text(formData, "email"));
  const password = text(formData, "password");
  const fieldErrors: AuthFieldErrors = {
    email: validateEmail(email),
    password: password ? undefined : "Enter your password.",
  };
  if (hasErrors(fieldErrors)) return { fieldErrors, values: { email } };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error?.code === "email_not_confirmed") {
    // Send a fresh code and continue confirmation. A rate-limit error here is fine:
    // the earlier code is still valid.
    await supabase.auth.resend({ type: "signup", email });
    redirect(withEmail("/verify", email, "&resent=1"));
  }
  if (error) return { error: describeAuthError(error), values: { email } };

  // `next` is validated by safeNextPath (same-site, absolute path only).
  redirect((safeNextPath(text(formData, "next")) as Route | null) ?? SIGNED_IN_HOME);
}

export async function signUp(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const rawName = text(formData, "name");
  const name = normalizeDisplayName(rawName);
  const email = normalizeEmail(text(formData, "email"));
  const password = text(formData, "password");
  const values = { name: rawName, email };

  const fieldErrors: AuthFieldErrors = {
    name: !name
      ? "Tell us what to call you."
      : Array.from(rawName.trim()).length > DISPLAY_NAME_MAX_LENGTH
        ? `Keep it to ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.`
        : undefined,
    email: validateEmail(email),
    password: validatePassword(password),
  };
  if (hasErrors(fieldErrors)) return { fieldErrors, values };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NOT_CONFIGURED;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Read by the `handle_new_user` trigger to create the profile.
    options: { data: { display_name: name } },
  });
  if (error) return { error: describeAuthError(error), values };
  if (isExistingAccountSignUp(data.user)) {
    return { error: "An account with this email already exists. Sign in instead.", values };
  }

  // Email confirmation off in Supabase → already signed in.
  if (data.session) redirect(SIGNED_IN_HOME);
  redirect(withEmail("/verify", email));
}

/** Confirms a new account with the emailed code, or (intent=resend) sends a new code. */
export async function verifyEmail(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(text(formData, "email"));
  const emailError = validateEmail(email);
  if (emailError) return { fieldErrors: { email: emailError }, values: { email } };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NOT_CONFIGURED;

  if (text(formData, "intent") === "resend") {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) return { error: describeAuthError(error), values: { email } };
    return { notice: `We've sent a new code to ${email}.`, values: { email } };
  }

  const code = normalizeOtp(text(formData, "code"));
  const codeError = validateOtp(code);
  if (codeError) return { fieldErrors: { code: codeError }, values: { email } };

  const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
  if (error) return { error: describeAuthError(error), values: { email } };

  redirect(SIGNED_IN_HOME);
}

export async function requestPasswordReset(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(text(formData, "email"));
  const emailError = validateEmail(email);
  if (emailError) return { fieldErrors: { email: emailError }, values: { email } };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return { error: describeAuthError(error), values: { email } };

  redirect(withEmail("/reset-password", email));
}

/** Verifies the emailed reset code and sets a new password, or (intent=resend) re-sends. */
export async function resetPassword(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(text(formData, "email"));
  const emailError = validateEmail(email);
  if (emailError) return { fieldErrors: { email: emailError }, values: { email } };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NOT_CONFIGURED;

  if (text(formData, "intent") === "resend") {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { error: describeAuthError(error), values: { email } };
    return { notice: `We've sent a new code to ${email}.`, values: { email } };
  }

  const code = normalizeOtp(text(formData, "code"));
  const password = text(formData, "password");
  const fieldErrors: AuthFieldErrors = {
    code: validateOtp(code),
    password: validatePassword(password),
  };
  if (hasErrors(fieldErrors)) return { fieldErrors, values: { email } };

  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "recovery",
  });
  if (verifyError) return { error: describeAuthError(verifyError), values: { email } };

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) return { error: describeAuthError(updateError), values: { email } };

  redirect(SIGNED_IN_HOME);
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect(SIGN_IN_PATH);
}

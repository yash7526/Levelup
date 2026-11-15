"use client";

import { DISPLAY_NAME_MAX_LENGTH } from "@levelup/utils";
import { useActionState } from "react";

import {
  type AuthFormState,
  requestPasswordReset,
  resetPassword,
  signIn,
  signUp,
  verifyEmail,
} from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/input";

import { FormMessage } from "./form-message";
import { PasswordField } from "./password-field";

const initialState: AuthFormState = {};

/** Six-ish digit code field tuned for mobile keyboards and OS one-time-code autofill. */
function CodeField({ error }: { error?: string }) {
  return (
    <TextField
      id="code"
      name="code"
      label="Code"
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={12}
      placeholder="123456"
      error={error}
      inputClassName="tracking-[0.3em] tabular-nums"
    />
  );
}

/** Email that was already provided: shown as text, submitted as a hidden field. */
function KnownEmail({ email }: { email: string }) {
  return <input type="hidden" name="email" value={email} />;
}

export function SignInForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signIn, initialState);
  return (
    <form action={action} noValidate className="grid gap-4">
      <FormMessage error={state.error} />
      <TextField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="current-password"
        error={state.fieldErrors?.password}
      />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Button type="submit" loading={pending} className="mt-1 w-full">
        Sign in
      </Button>
    </form>
  );
}

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, initialState);
  return (
    <form action={action} noValidate className="grid gap-4">
      <FormMessage error={state.error} />
      <TextField
        id="name"
        name="name"
        label="Your name"
        autoComplete="given-name"
        maxLength={DISPLAY_NAME_MAX_LENGTH}
        placeholder="What should we call you?"
        defaultValue={state.values?.name}
        error={state.fieldErrors?.name}
      />
      <TextField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="new-password"
        hint="At least 8 characters."
        error={state.fieldErrors?.password}
      />
      <Button type="submit" loading={pending} className="mt-1 w-full">
        Create account
      </Button>
    </form>
  );
}

export function VerifyEmailForm({ email, resent }: { email?: string; resent?: boolean }) {
  const [state, action, pending] = useActionState(
    verifyEmail,
    resent && email ? { notice: `We've sent a new code to ${email}.` } : initialState,
  );
  const knownEmail = state.values?.email ?? email;
  return (
    <form action={action} noValidate className="grid gap-4">
      <FormMessage error={state.error} notice={state.notice} />
      {knownEmail ? (
        <KnownEmail email={knownEmail} />
      ) : (
        <TextField
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          error={state.fieldErrors?.email}
        />
      )}
      <CodeField error={state.fieldErrors?.code} />
      <Button type="submit" name="intent" value="verify" loading={pending} className="w-full">
        Confirm email
      </Button>
      <Button type="submit" name="intent" value="resend" variant="ghost" disabled={pending}>
        Send a new code
      </Button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialState);
  return (
    <form action={action} noValidate className="grid gap-4">
      <FormMessage error={state.error} />
      <TextField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <Button type="submit" loading={pending} className="mt-1 w-full">
        Send reset code
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ email }: { email?: string }) {
  const [state, action, pending] = useActionState(resetPassword, initialState);
  const knownEmail = state.values?.email ?? email;
  return (
    <form action={action} noValidate className="grid gap-4">
      <FormMessage error={state.error} notice={state.notice} />
      {knownEmail ? (
        <KnownEmail email={knownEmail} />
      ) : (
        <TextField
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          error={state.fieldErrors?.email}
        />
      )}
      <CodeField error={state.fieldErrors?.code} />
      <PasswordField
        id="password"
        name="password"
        label="New password"
        autoComplete="new-password"
        hint="At least 8 characters."
        error={state.fieldErrors?.password}
      />
      <Button type="submit" name="intent" value="reset" loading={pending} className="w-full">
        Set new password
      </Button>
      <Button type="submit" name="intent" value="resend" variant="ghost" disabled={pending}>
        Send a new code
      </Button>
    </form>
  );
}

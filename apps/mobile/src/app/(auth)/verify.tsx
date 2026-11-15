import {
  describeAuthError,
  normalizeEmail,
  normalizeOtp,
  validateEmail,
  validateOtp,
} from "@levelup/supabase";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { AuthScreen, FormMessage } from "@/components/auth/auth-screen";
import { CodeField } from "@/components/auth/code-field";
import { TextLink } from "@/components/auth/text-link";
import { Button } from "@/components/ui/button";
import { AppText } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";
import { supabase } from "@/lib/supabase";

export default function VerifyScreen() {
  const params = useLocalSearchParams<{ email?: string; resent?: string }>();
  const paramEmail = params.email ? normalizeEmail(params.email) : "";
  const knownEmail = paramEmail && !validateEmail(paramEmail) ? paramEmail : "";

  const [email, setEmail] = useState(knownEmail);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string | undefined>(
    params.resent === "1" && knownEmail ? `We've sent a new code to ${knownEmail}.` : undefined,
  );
  const [pending, setPending] = useState(false);

  function checkEmail(): string | null {
    const address = normalizeEmail(email);
    const problem = validateEmail(address);
    setEmailError(problem);
    return problem ? null : address;
  }

  async function confirm() {
    const address = checkEmail();
    const token = normalizeOtp(code);
    const problem = validateOtp(token);
    setCodeError(problem);
    setError(undefined);
    setNotice(undefined);
    if (!address || problem || !supabase) return;

    setPending(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: address,
      token,
      type: "email",
    });
    setPending(false);
    if (verifyError) setError(describeAuthError(verifyError));
    // On success the user is signed in and navigation switches to the app.
  }

  async function resend() {
    const address = checkEmail();
    setError(undefined);
    setNotice(undefined);
    if (!address || !supabase) return;
    setPending(true);
    const { error: resendError } = await supabase.auth.resend({ type: "signup", email: address });
    setPending(false);
    if (resendError) setError(describeAuthError(resendError));
    else setNotice(`We've sent a new code to ${address}.`);
  }

  return (
    <AuthScreen
      title="Check your email"
      description={
        knownEmail
          ? `We sent a confirmation code to ${knownEmail}. Enter it below to finish creating your account.`
          : "Enter your email and the confirmation code we sent you."
      }
      footer={
        <>
          <AppText variant="body-sm" tone="muted" style={{ textAlign: "center" }}>
            Can&apos;t find it? Check your spam folder — it can take a minute to arrive.
          </AppText>
          <AppText variant="body-sm" tone="muted">
            Wrong email? <TextLink href="/sign-up">Start again</TextLink>
          </AppText>
        </>
      }
    >
      <FormMessage error={error} notice={notice} />
      {knownEmail ? null : (
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          error={emailError}
        />
      )}
      <CodeField
        value={code}
        onChangeText={setCode}
        onSubmitEditing={() => void confirm()}
        error={codeError}
      />
      <Button
        label="Confirm email"
        loading={pending}
        onPress={() => void confirm()}
        style={{ alignSelf: "stretch" }}
      />
      <Button
        label="Send a new code"
        variant="ghost"
        disabled={pending}
        onPress={() => void resend()}
        style={{ alignSelf: "stretch" }}
      />
    </AuthScreen>
  );
}

import {
  type AuthFieldErrors,
  describeAuthError,
  normalizeEmail,
  normalizeOtp,
  validateEmail,
  validateOtp,
  validatePassword,
} from "@levelup/supabase";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { AuthScreen, FormMessage } from "@/components/auth/auth-screen";
import { CodeField } from "@/components/auth/code-field";
import { TextLink } from "@/components/auth/text-link";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { AppText } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth";

export default function ResetPasswordScreen() {
  const { beginRecovery, endRecovery } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const paramEmail = params.email ? normalizeEmail(params.email) : "";
  const knownEmail = paramEmail && !validateEmail(paramEmail) ? paramEmail : "";

  const [email, setEmail] = useState(knownEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit() {
    const address = normalizeEmail(email);
    const token = normalizeOtp(code);
    const errors: AuthFieldErrors = {
      email: validateEmail(address),
      code: validateOtp(token),
      password: validatePassword(password),
    };
    setFieldErrors(errors);
    setError(undefined);
    setNotice(undefined);
    if (errors.email || errors.code || errors.password || !supabase) return;

    setPending(true);
    // Verifying the code signs the user in; keep this screen open until the new
    // password is saved, then let navigation switch to the app.
    beginRecovery();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: address,
      token,
      type: "recovery",
    });
    if (verifyError) {
      endRecovery();
      setPending(false);
      return setError(describeAuthError(verifyError));
    }
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (updateError) {
      // Signed in but the password wasn't changed: say so, then continue into the app.
      setError(describeAuthError(updateError));
      setTimeout(endRecovery, 2500);
      return;
    }
    endRecovery();
  }

  async function resend() {
    const address = normalizeEmail(email);
    const problem = validateEmail(address);
    setFieldErrors({ email: problem });
    setError(undefined);
    setNotice(undefined);
    if (problem || !supabase) return;
    setPending(true);
    const { error: resendError } = await supabase.auth.resetPasswordForEmail(address);
    setPending(false);
    if (resendError) setError(describeAuthError(resendError));
    else setNotice(`We've sent a new code to ${address}.`);
  }

  return (
    <AuthScreen
      title="Set a new password"
      description={
        knownEmail
          ? `If ${knownEmail} has a LevelUp account, we've sent it a code. Enter the code and choose a new password.`
          : "Enter your email, the code we sent you and a new password."
      }
      footer={
        <AppText variant="body-sm" tone="muted">
          <TextLink href="/sign-in">Back to sign in</TextLink>
        </AppText>
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
          error={fieldErrors.email}
        />
      )}
      <CodeField value={code} onChangeText={setCode} error={fieldErrors.code} />
      <PasswordField
        label="New password"
        value={password}
        onChangeText={setPassword}
        autoComplete="new-password"
        textContentType="newPassword"
        hint="At least 8 characters."
        returnKeyType="go"
        onSubmitEditing={() => void submit()}
        error={fieldErrors.password}
      />
      <Button
        label="Set new password"
        loading={pending}
        onPress={() => void submit()}
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

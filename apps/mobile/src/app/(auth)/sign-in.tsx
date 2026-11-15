import {
  type AuthFieldErrors,
  describeAuthError,
  normalizeEmail,
  validateEmail,
} from "@levelup/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";

import { AuthScreen, FormMessage } from "@/components/auth/auth-screen";
import { TextLink } from "@/components/auth/text-link";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { AppText } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";
import { supabase } from "@/lib/supabase";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit() {
    const address = normalizeEmail(email);
    const errors: AuthFieldErrors = {
      email: validateEmail(address),
      password: password ? undefined : "Enter your password.",
    };
    setFieldErrors(errors);
    setError(undefined);
    if (errors.email || errors.password || !supabase) return;

    setPending(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: address,
      password,
    });
    if (signInError?.code === "email_not_confirmed") {
      // Send a fresh code; a rate-limit error is fine (the earlier code still works).
      await supabase.auth.resend({ type: "signup", email: address });
      setPending(false);
      router.push({ pathname: "/verify", params: { email: address, resent: "1" } });
      return;
    }
    setPending(false);
    if (signInError) setError(describeAuthError(signInError));
    // On success the session changes and navigation switches to the app automatically.
  }

  return (
    <AuthScreen
      title="Welcome back"
      description="Sign in to pick up where you left off."
      footer={
        <>
          <AppText variant="body-sm" tone="muted">
            <TextLink href="/forgot-password">Forgot your password?</TextLink>
          </AppText>
          <AppText variant="body-sm" tone="muted">
            New to LevelUp? <TextLink href="/sign-up">Create an account</TextLink>
          </AppText>
        </>
      }
    >
      <FormMessage error={error} />
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        error={fieldErrors.email}
      />
      <PasswordField
        label="Password"
        value={password}
        onChangeText={setPassword}
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={() => void submit()}
        error={fieldErrors.password}
      />
      <Button
        label="Sign in"
        loading={pending}
        onPress={() => void submit()}
        style={{ alignSelf: "stretch" }}
      />
    </AuthScreen>
  );
}

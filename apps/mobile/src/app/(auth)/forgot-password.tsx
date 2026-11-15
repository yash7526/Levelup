import { describeAuthError, normalizeEmail, validateEmail } from "@levelup/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";

import { AuthScreen, FormMessage } from "@/components/auth/auth-screen";
import { TextLink } from "@/components/auth/text-link";
import { Button } from "@/components/ui/button";
import { AppText } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit() {
    const address = normalizeEmail(email);
    const problem = validateEmail(address);
    setEmailError(problem);
    setError(undefined);
    if (problem || !supabase) return;

    setPending(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(address);
    setPending(false);
    if (resetError) return setError(describeAuthError(resetError));
    router.push({ pathname: "/reset-password", params: { email: address } });
  }

  return (
    <AuthScreen
      title="Reset your password"
      description="Enter your account email and we'll send you a code to set a new password."
      footer={
        <AppText variant="body-sm" tone="muted">
          Remembered it? <TextLink href="/sign-in">Back to sign in</TextLink>
        </AppText>
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
        returnKeyType="go"
        onSubmitEditing={() => void submit()}
        error={emailError}
      />
      <Button
        label="Send reset code"
        loading={pending}
        onPress={() => void submit()}
        style={{ alignSelf: "stretch" }}
      />
    </AuthScreen>
  );
}

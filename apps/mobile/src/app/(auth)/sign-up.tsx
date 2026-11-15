import {
  type AuthFieldErrors,
  describeAuthError,
  isExistingAccountSignUp,
  normalizeEmail,
  validateEmail,
  validatePassword,
} from "@levelup/supabase";
import { DISPLAY_NAME_MAX_LENGTH, normalizeDisplayName } from "@levelup/utils";
import { useRouter } from "expo-router";
import { useState } from "react";

import { AuthScreen, FormMessage } from "@/components/auth/auth-screen";
import { TextLink } from "@/components/auth/text-link";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { AppText } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";
import { supabase } from "@/lib/supabase";

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit() {
    const displayName = normalizeDisplayName(name);
    const address = normalizeEmail(email);
    const errors: AuthFieldErrors = {
      name: !displayName
        ? "Tell us what to call you."
        : Array.from(name.trim()).length > DISPLAY_NAME_MAX_LENGTH
          ? `Keep it to ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.`
          : undefined,
      email: validateEmail(address),
      password: validatePassword(password),
    };
    setFieldErrors(errors);
    setError(undefined);
    if (errors.name || errors.email || errors.password || !supabase) return;

    setPending(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: address,
      password,
      // Read by the `handle_new_user` trigger to create the profile.
      options: { data: { display_name: displayName } },
    });
    setPending(false);

    if (signUpError) return setError(describeAuthError(signUpError));
    if (isExistingAccountSignUp(data.user)) {
      return setError("An account with this email already exists. Sign in instead.");
    }
    // With email confirmation off, a session exists and navigation switches automatically.
    if (!data.session) router.push({ pathname: "/verify", params: { email: address } });
  }

  return (
    <AuthScreen
      title="Create your account"
      description="Build habits, reach goals and keep learning — one day at a time."
      footer={
        <AppText variant="body-sm" tone="muted">
          Already have an account? <TextLink href="/sign-in">Sign in</TextLink>
        </AppText>
      }
    >
      <FormMessage error={error} />
      <TextField
        label="Your name"
        value={name}
        onChangeText={setName}
        placeholder="What should we call you?"
        autoCapitalize="words"
        autoComplete="given-name"
        textContentType="givenName"
        maxLength={DISPLAY_NAME_MAX_LENGTH}
        returnKeyType="next"
        error={fieldErrors.name}
      />
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
        autoComplete="new-password"
        textContentType="newPassword"
        hint="At least 8 characters."
        returnKeyType="go"
        onSubmitEditing={() => void submit()}
        error={fieldErrors.password}
      />
      <Button
        label="Create account"
        loading={pending}
        onPress={() => void submit()}
        style={{ alignSelf: "stretch" }}
      />
    </AuthScreen>
  );
}

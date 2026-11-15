import { Stack } from "expo-router";

/** Opening the account screens lands on sign-in. */
export const unstable_settings = { anchor: "sign-in" };

/** Account screens: full-screen, no header (each screen draws its own frame). */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}

import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, type Theme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, useMemo } from "react";

import { PreferencesProvider, usePreferences } from "@/providers/preferences";
import { ViewerProvider } from "@/providers/viewer";
import { fontAssets } from "@/theme/fonts";
import { useTheme } from "@/theme/use-theme";

// Keep the native splash screen up until fonts and saved preferences are ready,
// so the first frame already has the right fonts and theme.
void SplashScreen.preventAutoHideAsync();

// Expo Router's built-in boundary renders outside our providers, so it is safe even
// if the providers themselves fail.
export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  return (
    <PreferencesProvider>
      <ViewerProvider>
        {/* If fonts fail to load, continue with system fonts rather than blocking. */}
        <RootNavigator fontsReady={fontsLoaded || fontError !== null} />
      </ViewerProvider>
    </PreferencesProvider>
  );
}

function RootNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { ready: preferencesReady } = usePreferences();
  const theme = useTheme();
  const appReady = fontsReady && preferencesReady;

  // Root view colour shows behind screens during transitions and the keyboard.
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.background);
  }, [theme]);

  useEffect(() => {
    if (appReady) void SplashScreen.hideAsync();
  }, [appReady]);

  const navigationTheme = useMemo<Theme>(() => {
    const base = theme.name === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.background,
        text: theme.colors.foreground,
        border: theme.colors.border,
        notification: theme.colors.danger,
      },
    };
  }, [theme]);

  if (!appReady) return null;

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={theme.name === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.foreground,
          headerTitleStyle: { fontFamily: "Manrope_700Bold" },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="learning" options={{ title: "Learning" }} />
        <Stack.Screen name="coach" options={{ title: "AI Coach" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
        <Stack.Screen name="+not-found" options={{ title: "Not found" }} />
      </Stack>
    </ThemeProvider>
  );
}

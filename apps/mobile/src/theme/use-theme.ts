import { useColorScheme } from "react-native";

import { usePreferences } from "@/providers/preferences";

import { type AppTheme, themes } from "./theme";

/** The active theme: the saved preference, or the device setting when set to "system". */
export function useTheme(): AppTheme {
  const { themePreference } = usePreferences();
  const system = useColorScheme();
  if (themePreference === "system") return system === "dark" ? themes.dark : themes.light;
  return themes[themePreference];
}

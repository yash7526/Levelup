// Per-weight imports bundle only the six font files the app uses.
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { Manrope_700Bold } from "@expo-google-fonts/manrope/700Bold";
import { Manrope_800ExtraBold } from "@expo-google-fonts/manrope/800ExtraBold";
import type { FontFamilyRole } from "@levelup/tokens";

export const fontAssets = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
};

export type FontName = keyof typeof fontAssets;

/** Android ignores `fontWeight` for custom fonts, so each weight is its own family. */
export function fontFamily(role: FontFamilyRole, weight: number): FontName {
  if (role === "display") return weight >= 800 ? "Manrope_800ExtraBold" : "Manrope_700Bold";
  if (weight >= 700) return "Inter_700Bold";
  if (weight >= 600) return "Inter_600SemiBold";
  if (weight >= 500) return "Inter_500Medium";
  return "Inter_400Regular";
}

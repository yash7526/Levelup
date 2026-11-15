import {
  colors,
  type ColorTheme,
  elevation,
  type ElevationName,
  hexToRgb,
  radii,
  spacing,
  textStyles,
  type TextStyleName,
  type ThemeName,
  toCssShadow,
} from "@levelup/tokens";
import type { TextStyle } from "react-native";

import { fontFamily } from "./fonts";

export { radii, spacing };

/** Token text styles translated for React Native (px letter-spacing, per-weight families). */
export const typography = Object.fromEntries(
  Object.entries(textStyles).map(([name, style]) => [
    name,
    {
      fontFamily: fontFamily(style.family, style.weight),
      fontSize: style.size,
      lineHeight: style.lineHeight,
      letterSpacing: Number((style.letterSpacing * style.size).toFixed(2)),
      ...("uppercase" in style && style.uppercase ? { textTransform: "uppercase" } : {}),
    } satisfies TextStyle,
  ]),
) as Record<TextStyleName, TextStyle>;

/** `#183C32` + 0.12 → `rgba(24, 60, 50, 0.12)`, the native equivalent of `bg-primary/12`. */
export function alpha(hex: string, opacity: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export interface AppTheme {
  name: ThemeName;
  colors: ColorTheme;
  /** CSS-style `boxShadow` values (supported natively by React Native's New Architecture). */
  shadow: Readonly<Record<ElevationName, string>>;
}

function createTheme(name: ThemeName): AppTheme {
  const layers = elevation[name];
  return {
    name,
    colors: colors[name],
    shadow: {
      card: toCssShadow(layers.card),
      raised: toCssShadow(layers.raised),
      floating: toCssShadow(layers.floating),
    },
  };
}

export const themes: Readonly<Record<ThemeName, AppTheme>> = {
  light: createTheme("light"),
  dark: createTheme("dark"),
};

/** Horizontal page gutter. */
export const gutter = spacing[5];

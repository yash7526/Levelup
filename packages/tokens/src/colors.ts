import { palette } from "./palette";

/**
 * Semantic colour roles. Components reference roles, never raw palette values,
 * so light and dark themes (and future platforms) stay consistent.
 */
export const colorRoles = [
  "background",
  "surface",
  "surfaceMuted",
  "surfaceHover",
  "foreground",
  "foregroundMuted",
  "foregroundSubtle",
  "border",
  "borderStrong",
  "primary",
  "primaryHover",
  "primaryForeground",
  "accent",
  "accentHover",
  "accentForeground",
  "brand",
  "brandForeground",
  "brandMuted",
  "ring",
  "track",
  "success",
  "successSubtle",
  "warning",
  "warningSubtle",
  "danger",
  "dangerSubtle",
  "dangerForeground",
  "overlay",
] as const;

export type ColorRole = (typeof colorRoles)[number];
export type ColorTheme = Readonly<Record<ColorRole, string>>;
export type ThemeName = "light" | "dark";

export const lightColors: ColorTheme = {
  background: palette.stone[50],
  surface: palette.white,
  surfaceMuted: palette.stone[100],
  surfaceHover: "#E9EBE4",
  foreground: palette.stone[900],
  foregroundMuted: palette.stone[600],
  foregroundSubtle: "#6E766C",
  border: palette.stone[200],
  borderStrong: palette.stone[300],

  primary: palette.forest[700],
  primaryHover: palette.forest[600],
  primaryForeground: palette.white,

  accent: palette.lime[300],
  accentHover: palette.lime[400],
  accentForeground: palette.forest[700],

  brand: palette.forest[700],
  brandForeground: palette.stone[50],
  brandMuted: palette.forest[200],

  ring: palette.forest[700],
  track: "#E8EAE3",

  success: palette.green[600],
  successSubtle: palette.green[100],
  warning: palette.amber[600],
  warningSubtle: palette.amber[100],
  danger: palette.red[600],
  dangerSubtle: palette.red[100],
  dangerForeground: palette.white,

  overlay: "rgba(18, 22, 19, 0.45)",
};

/**
 * Dark theme. The brand forest (#183C32) is too dark to carry interactive
 * elements on a near-black canvas, so the lime accent becomes the primary
 * action colour while forest remains the brand surface.
 */
export const darkColors: ColorTheme = {
  background: "#0E1210",
  surface: "#161B18",
  surfaceMuted: "#1D231F",
  surfaceHover: "#232A25",
  foreground: "#ECEFE9",
  foregroundMuted: "#A5ADA3",
  foregroundSubtle: "#899187",
  border: "#262D28",
  borderStrong: "#363F38",

  primary: palette.lime[300],
  primaryHover: palette.lime[200],
  primaryForeground: palette.forest[900],

  accent: palette.lime[300],
  accentHover: palette.lime[200],
  accentForeground: palette.forest[900],

  brand: "#173A30",
  brandForeground: palette.stone[50],
  brandMuted: palette.forest[200],

  ring: palette.lime[300],
  track: "#262D28",

  success: palette.green[300],
  successSubtle: "#15271D",
  warning: palette.amber[300],
  warningSubtle: "#2B2213",
  danger: palette.red[300],
  dangerSubtle: "#2F1915",
  dangerForeground: palette.forest[950],

  overlay: "rgba(0, 0, 0, 0.6)",
};

export const colors: Readonly<Record<ThemeName, ColorTheme>> = {
  light: lightColors,
  dark: darkColors,
};

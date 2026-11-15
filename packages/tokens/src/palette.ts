/**
 * Raw brand palette. These values never change between themes.
 * Product code should prefer the semantic colours in `colors.ts`.
 *
 * Brand anchors (from the LevelUp design direction):
 *   forest.700  #183C32  — primary
 *   lime.300    #C8F36A  — accent
 *   stone.50    #F7F7F4  — background
 *   stone.900   #202520  — text
 *   white       #FFFFFF  — surface
 */
export const palette = {
  white: "#FFFFFF",
  black: "#000000",

  forest: {
    50: "#EEF4F1",
    100: "#D6E5DE",
    200: "#ADCBBD",
    300: "#7FAB97",
    400: "#538A72",
    500: "#336B55",
    600: "#245343",
    700: "#183C32",
    800: "#123028",
    900: "#0C211B",
    950: "#07140F",
  },

  lime: {
    50: "#F9FDEC",
    100: "#F0FBCF",
    200: "#E2F8A3",
    300: "#C8F36A",
    400: "#B5E443",
    500: "#97C827",
    600: "#759E1A",
    700: "#587818",
    800: "#475F19",
    900: "#3C501A",
  },

  /** Warm, faintly green-tinted neutrals. */
  stone: {
    50: "#F7F7F4",
    100: "#EFF0EB",
    200: "#E3E5DE",
    300: "#CDD1C8",
    400: "#A3AAA1",
    500: "#7A8278",
    600: "#5A625A",
    700: "#40473F",
    800: "#2B312B",
    900: "#202520",
    950: "#121613",
  },

  red: {
    100: "#FBE7E3",
    300: "#F29A8C",
    500: "#E0604E",
    600: "#B5372A",
  },

  amber: {
    100: "#FBF0DC",
    300: "#EDBE6E",
    500: "#D99A36",
    600: "#9A5B0E",
  },

  green: {
    100: "#E3F2E9",
    300: "#7DD3A5",
    500: "#4FB57F",
    600: "#2A7650",
  },
} as const;

export type Palette = typeof palette;

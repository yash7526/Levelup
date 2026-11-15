/**
 * Typography: Manrope for display and headings, Inter for interface and body text.
 * Sizes and line heights are in px so they map 1:1 to React Native; the CSS
 * generator converts them to rem.
 */
export const fontFamilies = {
  display: "Manrope",
  body: "Inter",
} as const;

export type FontFamilyRole = keyof typeof fontFamilies;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export interface TextStyle {
  family: FontFamilyRole;
  /** Font size in px. */
  size: number;
  /** Line height in px. */
  lineHeight: number;
  weight: (typeof fontWeights)[keyof typeof fontWeights];
  /** Letter spacing in em (multiply by `size` for React Native px). */
  letterSpacing: number;
  uppercase?: boolean;
}

export const textStyles = {
  display: { family: "display", size: 40, lineHeight: 46, weight: 700, letterSpacing: -0.025 },
  "heading-1": { family: "display", size: 30, lineHeight: 36, weight: 700, letterSpacing: -0.02 },
  "heading-2": { family: "display", size: 22, lineHeight: 28, weight: 700, letterSpacing: -0.015 },
  "heading-3": { family: "display", size: 17, lineHeight: 24, weight: 700, letterSpacing: -0.01 },
  "body-lg": { family: "body", size: 17, lineHeight: 26, weight: 400, letterSpacing: -0.005 },
  body: { family: "body", size: 15, lineHeight: 22, weight: 400, letterSpacing: -0.003 },
  "body-sm": { family: "body", size: 13, lineHeight: 19, weight: 400, letterSpacing: 0 },
  label: { family: "body", size: 14, lineHeight: 20, weight: 500, letterSpacing: -0.003 },
  caption: { family: "body", size: 12, lineHeight: 16, weight: 500, letterSpacing: 0 },
  overline: {
    family: "body",
    size: 11,
    lineHeight: 14,
    weight: 600,
    letterSpacing: 0.08,
    uppercase: true,
  },
} as const satisfies Record<string, TextStyle>;

export type TextStyleName = keyof typeof textStyles;

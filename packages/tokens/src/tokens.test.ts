import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { type ColorRole, colors, type ThemeName } from "./colors";
import { contrastRatio, hexToRgb } from "./contrast";
import { createTokenStylesheet } from "./css";
import { elevation, toNativeShadow } from "./elevation";

const AA_TEXT = 4.5;
const AA_NON_TEXT = 3;

/** [foreground, background, minimum ratio] pairs that real UI relies on. */
const pairs: [ColorRole, ColorRole, number][] = [
  ["foreground", "background", 7],
  ["foreground", "surface", 7],
  ["foregroundMuted", "background", AA_TEXT],
  ["foregroundMuted", "surface", AA_TEXT],
  ["foregroundMuted", "surfaceMuted", AA_TEXT],
  ["foregroundSubtle", "surface", AA_TEXT],
  ["primaryForeground", "primary", AA_TEXT],
  ["accentForeground", "accent", AA_TEXT],
  ["brandForeground", "brand", AA_TEXT],
  ["brandMuted", "brand", AA_TEXT],
  ["dangerForeground", "danger", AA_TEXT],
  ["success", "surface", AA_TEXT],
  ["warning", "surface", AA_TEXT],
  ["danger", "surface", AA_TEXT],
  ["success", "successSubtle", AA_TEXT],
  ["warning", "warningSubtle", AA_TEXT],
  ["danger", "dangerSubtle", AA_TEXT],
  ["primary", "background", AA_NON_TEXT],
  ["ring", "background", AA_NON_TEXT],
  ["ring", "surface", AA_NON_TEXT],
];

describe.each<ThemeName>(["light", "dark"])("%s theme contrast", (theme) => {
  it.each(pairs)("%s on %s meets %d:1", (fg, bg, minimum) => {
    const ratio = contrastRatio(colors[theme][fg], colors[theme][bg]);
    expect(ratio).toBeGreaterThanOrEqual(minimum);
  });
});

describe("brand anchors", () => {
  it("uses the specified LevelUp colours in the light theme", () => {
    expect(colors.light.background).toBe("#F7F7F4");
    expect(colors.light.primary).toBe("#183C32");
    expect(colors.light.accent).toBe("#C8F36A");
    expect(colors.light.foreground).toBe("#202520");
    expect(colors.light.surface).toBe("#FFFFFF");
  });
});

describe("hexToRgb", () => {
  it("parses long and short hex", () => {
    expect(hexToRgb("#183C32")).toEqual({ r: 24, g: 60, b: 50 });
    expect(hexToRgb("#fff")).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("rejects invalid input", () => {
    expect(() => hexToRgb("not-a-colour")).toThrow();
  });
});

describe("createTokenStylesheet", () => {
  const css = createTokenStylesheet();

  it("defines every semantic role for both themes", () => {
    for (const role of Object.keys(colors.light)) {
      const name = role.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      expect(css).toContain(`--color-${name}: var(--lu-color-${name});`);
    }
    expect(css).toContain(":root {");
    expect(css).toContain(".dark {");
  });

  it("emits the type scale with line heights", () => {
    expect(css).toContain("--text-display: 2.5rem;");
    expect(css).toContain("--text-display--line-height:");
  });

  it("matches the committed generated/tokens.css (run `pnpm --filter @levelup/tokens generate`)", () => {
    const committed = readFileSync(new URL("../generated/tokens.css", import.meta.url), "utf8");
    expect(committed.replace(/\r\n/g, "\n")).toBe(css);
  });
});

describe("toNativeShadow", () => {
  it("maps the strongest layer to React Native props", () => {
    const shadow = toNativeShadow(elevation.light.raised);
    expect(shadow.shadowOffset.height).toBe(12);
    expect(shadow.shadowRadius).toBe(14);
  });
});

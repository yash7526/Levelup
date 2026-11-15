import { type ThemeName } from "./colors";
import { hexToRgb } from "./contrast";

export interface ShadowLayer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  /** Hex colour. */
  color: string;
  opacity: number;
}

export type ElevationName = "card" | "raised" | "floating";

const ink = "#101814";

/**
 * Elevation is defined structurally so it can be rendered as CSS `box-shadow`
 * on the web and as native shadow props on iOS/Android.
 */
export const elevation: Readonly<
  Record<ThemeName, Readonly<Record<ElevationName, readonly ShadowLayer[]>>>
> = {
  light: {
    card: [
      { x: 0, y: 1, blur: 2, spread: 0, color: ink, opacity: 0.04 },
      { x: 0, y: 2, blur: 8, spread: -2, color: ink, opacity: 0.05 },
    ],
    raised: [
      { x: 0, y: 2, blur: 4, spread: 0, color: ink, opacity: 0.04 },
      { x: 0, y: 12, blur: 28, spread: -8, color: ink, opacity: 0.12 },
    ],
    floating: [
      { x: 0, y: 4, blur: 8, spread: 0, color: ink, opacity: 0.05 },
      { x: 0, y: 24, blur: 48, spread: -12, color: ink, opacity: 0.22 },
    ],
  },
  dark: {
    card: [{ x: 0, y: 1, blur: 2, spread: 0, color: "#000000", opacity: 0.3 }],
    raised: [{ x: 0, y: 12, blur: 28, spread: -8, color: "#000000", opacity: 0.5 }],
    floating: [{ x: 0, y: 24, blur: 48, spread: -12, color: "#000000", opacity: 0.65 }],
  },
};

export function toCssShadow(layers: readonly ShadowLayer[]): string {
  return layers
    .map(({ x, y, blur, spread, color, opacity }) => {
      const { r, g, b } = hexToRgb(color);
      return `${x}px ${y}px ${blur}px ${spread}px rgba(${r}, ${g}, ${b}, ${opacity})`;
    })
    .join(", ");
}

export interface NativeShadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  /** Android elevation approximation. */
  elevation: number;
}

/** Collapses the strongest layer into React Native shadow props. */
export function toNativeShadow(layers: readonly ShadowLayer[]): NativeShadow {
  const strongest = layers.reduce((best, layer) => (layer.blur > best.blur ? layer : best));
  return {
    shadowColor: strongest.color,
    shadowOffset: { width: strongest.x, height: strongest.y },
    shadowOpacity: strongest.opacity,
    shadowRadius: strongest.blur / 2,
    elevation: Math.round(strongest.y / 2),
  };
}

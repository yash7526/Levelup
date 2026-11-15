/**
 * Spacing follows a 4px grid. On the web this is identical to Tailwind's default
 * spacing scale (`p-4` = 16px), so the web uses Tailwind utilities directly;
 * React Native consumers use these numbers.
 */
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

/** Corner radii in px. */
export const radii = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
} as const;

/** Breakpoints in px (mobile-first, min-width). Matches Tailwind defaults. */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/** App-shell dimensions in px. */
export const layout = {
  sidebarWidth: 264,
  contentMaxWidth: 1200,
  mobileHeaderHeight: 60,
  bottomNavHeight: 68,
  minTouchTarget: 44,
} as const;

/** Motion durations in ms and easing curves as cubic-bezier control points. */
export const motion = {
  duration: {
    instant: 80,
    fast: 150,
    base: 220,
    slow: 360,
  },
  easing: {
    standard: [0.2, 0, 0, 1],
    emphasized: [0.3, 0, 0, 1],
    exit: [0.4, 0, 1, 1],
  },
} as const satisfies {
  duration: Record<string, number>;
  easing: Record<string, readonly [number, number, number, number]>;
};

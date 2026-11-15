import { clamp } from "@levelup/utils";
import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { alpha } from "@/theme/theme";
import { useTheme } from "@/theme/use-theme";

/**
 * `onBrand` is for progress drawn on the forest brand surface. Tracks are a light
 * tint of the fill colour (not grey) so state reads across the whole bar.
 */
export type ProgressTone = "primary" | "accent" | "success" | "onBrand";

function useToneColors(tone: ProgressTone): { fill: string; track: string } {
  const { colors } = useTheme();
  switch (tone) {
    case "accent":
      return { fill: colors.accent, track: alpha(colors.accent, 0.3) };
    case "success":
      return { fill: colors.success, track: alpha(colors.success, 0.15) };
    case "onBrand":
      return { fill: colors.accent, track: alpha(colors.brandForeground, 0.15) };
    case "primary":
      return { fill: colors.primary, track: alpha(colors.primary, 0.12) };
  }
}

function toPercent(value: number, max: number): number {
  return max > 0 ? clamp((value / max) * 100, 0, 100) : 0;
}

interface ProgressBarProps {
  value: number;
  max?: number;
  /** Accessible name, e.g. "Run a half marathon progress". */
  label: string;
  /** Spoken value, e.g. "3 of 8 milestones". */
  valueText?: string;
  tone?: ProgressTone;
  size?: "sm" | "md";
  style?: ViewStyle;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  valueText,
  tone = "primary",
  size = "md",
  style,
}: ProgressBarProps) {
  const { fill, track } = useToneColors(tone);
  const percent = toPercent(value, max);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max, now: value, text: valueText }}
      style={[styles.track, { height: size === "sm" ? 6 : 8, backgroundColor: track }, style]}
    >
      {percent > 0 ? (
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: fill }]} />
      ) : null}
    </View>
  );
}

interface ProgressRingProps {
  value: number;
  max?: number;
  label: string;
  valueText?: string;
  tone?: ProgressTone;
  size?: number;
  strokeWidth?: number;
  /** Content centred inside the ring, typically the headline figure. */
  children?: ReactNode;
}

export function ProgressRing({
  value,
  max = 100,
  label,
  valueText,
  tone = "primary",
  size = 128,
  strokeWidth = 10,
  children,
}: ProgressRingProps) {
  const { fill, track } = useToneColors(tone);
  const percent = toPercent(value, max);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max, now: value, text: valueText }}
      style={[styles.ring, { width: size, height: size }]}
    >
      <Svg width={size} height={size} style={styles.ringSvg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={track}
          strokeWidth={strokeWidth}
        />
        {percent > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={fill}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - percent / 100)}
          />
        ) : null}
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: "100%", borderRadius: 999, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 999 },
  ring: { alignItems: "center", justifyContent: "center" },
  ringSvg: { position: "absolute", transform: [{ rotate: "-90deg" }] },
});

import { StyleSheet, View, type ViewStyle } from "react-native";

import { alpha } from "@/theme/theme";
import { useTheme } from "@/theme/use-theme";

import { AppText, type TextTone } from "./text";

export type BadgeVariant = "neutral" | "accent" | "success" | "warning" | "outline" | "sample";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ label, variant = "neutral", style }: BadgeProps) {
  const { colors } = useTheme();
  const variants: Record<BadgeVariant, { container: ViewStyle; tone: TextTone }> = {
    neutral: { container: { backgroundColor: colors.surfaceMuted }, tone: "muted" },
    accent: { container: { backgroundColor: colors.accent }, tone: "onAccent" },
    success: { container: { backgroundColor: colors.successSubtle }, tone: "success" },
    warning: { container: { backgroundColor: colors.warningSubtle }, tone: "warning" },
    outline: { container: { borderWidth: 1, borderColor: colors.borderStrong }, tone: "muted" },
    // Marks illustrative data. The dashed edge reads as "placeholder" at a glance.
    sample: {
      container: {
        backgroundColor: colors.warningSubtle,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: alpha(colors.warning, 0.6),
      },
      tone: "warning",
    },
  };
  const { container, tone } = variants[variant];
  return (
    <View style={[styles.base, container, style]}>
      <AppText variant="caption" tone={tone} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

/** Standard label for any surface rendering sample data. */
export function SampleBadge() {
  return (
    <View accessible accessibilityLabel="Sample data, not yours">
      <Badge label="Sample" variant="sample" />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
});

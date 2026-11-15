import { StyleSheet, View, type ViewProps } from "react-native";

import { alpha, radii, spacing } from "@/theme/theme";
import { useTheme } from "@/theme/use-theme";

export type CardVariant = "default" | "muted" | "brand" | "outline";

interface CardProps extends ViewProps {
  variant?: CardVariant;
}

export function Card({ variant = "default", style, ...props }: CardProps) {
  const { colors, shadow } = useTheme();
  const variants: Record<CardVariant, ViewProps["style"]> = {
    default: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: alpha(colors.border, 0.7),
      boxShadow: shadow.card,
    },
    muted: { backgroundColor: colors.surfaceMuted },
    brand: { backgroundColor: colors.brand, boxShadow: shadow.raised },
    outline: { borderWidth: 1, borderColor: colors.border },
  };
  return <View {...props} style={[styles.base, variants[variant], style]} />;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii["2xl"],
    padding: spacing[5],
  },
});

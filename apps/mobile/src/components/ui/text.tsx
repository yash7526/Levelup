import type { TextStyleName } from "@levelup/tokens";
import { Text, type TextProps } from "react-native";

import { typography } from "@/theme/theme";
import { useTheme } from "@/theme/use-theme";

export type TextTone =
  | "default"
  | "muted"
  | "subtle"
  | "primary"
  | "onPrimary"
  | "onAccent"
  | "onBrand"
  | "onBrandMuted"
  | "success"
  | "warning"
  | "danger";

export interface AppTextProps extends TextProps {
  variant?: TextStyleName;
  tone?: TextTone;
}

/** Text in the LevelUp type scale, coloured by semantic tone. */
export function AppText({ variant = "body", tone = "default", style, ...props }: AppTextProps) {
  const { colors } = useTheme();
  const toneColor: Record<TextTone, string> = {
    default: colors.foreground,
    muted: colors.foregroundMuted,
    subtle: colors.foregroundSubtle,
    primary: colors.primary,
    onPrimary: colors.primaryForeground,
    onAccent: colors.accentForeground,
    onBrand: colors.brandForeground,
    onBrandMuted: colors.brandMuted,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
  };
  return <Text {...props} style={[typography[variant], { color: toneColor[tone] }, style]} />;
}

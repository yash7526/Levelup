import { type Href, Link } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  Text,
  type ViewStyle,
} from "react-native";

import { alpha, typography } from "@/theme/theme";
import { useTheme } from "@/theme/use-theme";

import type { IconComponent } from "./icon";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "accent" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const sizes = {
  sm: { height: 40, paddingHorizontal: 14, fontSize: 13, icon: 16 },
  md: { height: 48, paddingHorizontal: 20, fontSize: 14, icon: 18 },
  lg: { height: 52, paddingHorizontal: 24, fontSize: 15, icon: 18 },
} as const;

export interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconComponent;
  iconPosition?: "start" | "end";
  /** Shows a spinner and disables the button. */
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "start",
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { colors, shadow } = useTheme();
  const palette: Record<
    ButtonVariant,
    { bg: string; pressed: string; fg: string; border?: string }
  > = {
    primary: { bg: colors.primary, pressed: colors.primaryHover, fg: colors.primaryForeground },
    secondary: { bg: colors.surfaceMuted, pressed: colors.surfaceHover, fg: colors.foreground },
    outline: {
      bg: colors.surface,
      pressed: colors.surfaceMuted,
      fg: colors.foreground,
      border: colors.borderStrong,
    },
    ghost: { bg: "transparent", pressed: colors.surfaceMuted, fg: colors.foreground },
    accent: { bg: colors.accent, pressed: colors.accentHover, fg: colors.accentForeground },
    danger: {
      bg: colors.danger,
      pressed: alpha(colors.danger, 0.88),
      fg: colors.dangerForeground,
    },
  };
  const tone = palette[variant];
  const dimensions = sizes[size];
  const isDisabled = Boolean(disabled) || loading;
  const icon = Icon ? <Icon size={dimensions.icon} color={tone.fg} strokeWidth={2.25} /> : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={size === "sm" ? 4 : undefined}
      {...props}
      style={({ pressed }) => [
        styles.base,
        {
          height: dimensions.height,
          paddingHorizontal: dimensions.paddingHorizontal,
          backgroundColor: pressed ? tone.pressed : tone.bg,
          borderColor: tone.border ?? "transparent",
          borderWidth: tone.border ? 1 : 0,
          opacity: isDisabled ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        variant === "primary" && { boxShadow: shadow.card },
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={tone.fg} /> : null}
      {!loading && iconPosition === "start" ? icon : null}
      <Text
        numberOfLines={1}
        style={[
          typography.label,
          { fontFamily: "Inter_600SemiBold", fontSize: dimensions.fontSize, color: tone.fg },
        ]}
      >
        {label}
      </Text>
      {!loading && iconPosition === "end" ? icon : null}
    </Pressable>
  );
}

export interface ButtonLinkProps extends ButtonProps {
  href: Href;
}

/** A navigation link styled as a button. */
export function ButtonLink({ href, ...props }: ButtonLinkProps) {
  return (
    <Link href={href} asChild>
      <Button accessibilityRole="link" {...props} />
    </Link>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
});

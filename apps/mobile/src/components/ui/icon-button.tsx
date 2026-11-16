import { Pressable, type PressableProps, StyleSheet } from "react-native";

import { useTheme } from "@/theme/use-theme";

import type { IconComponent } from "./icon";

interface IconButtonProps extends Omit<PressableProps, "children" | "style"> {
  icon: IconComponent;
  /** Accessible name; icon-only buttons must always have one. */
  label: string;
  tone?: "default" | "muted";
}

/** A 40px round, icon-only button (with a 48px touch target). */
export function IconButton({
  icon: Icon,
  label,
  tone = "muted",
  disabled,
  ...props
}: IconButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={4}
      {...props}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? colors.surfaceMuted : "transparent",
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      <Icon size={18} color={tone === "muted" ? colors.foregroundMuted : colors.foreground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

import { Pressable, StyleSheet } from "react-native";

import { alpha } from "@/theme/theme";
import { useTheme } from "@/theme/use-theme";

import { AppText } from "./text";

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** `radio` inside a single-choice group, `checkbox` for multi-choice. */
  role?: "radio" | "checkbox";
  /** Spoken label when the visible one is abbreviated (e.g. "Mon" → "Monday"). */
  accessibilityLabel?: string;
  /** Stretch to share a row with other chips. */
  grow?: boolean;
}

/** A selectable pill for small choice sets. */
export function Chip({
  label,
  selected,
  onPress,
  role = "radio",
  accessibilityLabel,
  grow = false,
}: ChipProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityState={{ checked: selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        styles.chip,
        grow && styles.grow,
        {
          borderColor: selected ? colors.primary : colors.borderStrong,
          backgroundColor: selected
            ? alpha(colors.primary, 0.1)
            : pressed
              ? colors.surfaceMuted
              : colors.surface,
        },
      ]}
    >
      <AppText
        variant="body-sm"
        tone={selected ? "primary" : "default"}
        style={selected ? styles.selectedText : styles.text}
        numberOfLines={1}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  grow: { flexGrow: 1, flexBasis: 0, paddingHorizontal: 4 },
  text: { fontFamily: "Inter_500Medium" },
  selectedText: { fontFamily: "Inter_600SemiBold" },
});

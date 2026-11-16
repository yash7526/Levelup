import { Check } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";

import { useTheme } from "@/theme/use-theme";

interface CheckToggleProps {
  checked: boolean;
  /** Accessible name; the checked state is announced separately. */
  label: string;
  onToggle: () => void;
  size?: "md" | "lg";
}

/** A round tick button with checkbox semantics, for priorities and habits. */
export function CheckToggle({ checked, label, onToggle, size = "md" }: CheckToggleProps) {
  const { colors } = useTheme();
  const diameter = size === "lg" ? 44 : 32;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={onToggle}
      hitSlop={size === "lg" ? 4 : 8}
      style={({ pressed }) => [
        styles.base,
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          borderColor: checked ? colors.primary : colors.borderStrong,
          backgroundColor: checked ? colors.primary : colors.surface,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
      ]}
    >
      {checked ? (
        <Check size={size === "lg" ? 20 : 16} color={colors.primaryForeground} strokeWidth={3} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: 2, alignItems: "center", justifyContent: "center" },
});

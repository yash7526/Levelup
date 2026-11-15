import { Pressable, StyleSheet, View } from "react-native";

import { useTheme } from "@/theme/use-theme";

import type { IconComponent } from "./icon";
import { AppText } from "./text";

interface Option<T extends string> {
  value: T;
  label: string;
  icon?: IconComponent;
}

interface SegmentedControlProps<T extends string> {
  /** Accessible name of the group. */
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Single-choice control exposed to assistive tech as a radio group. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { colors, shadow } = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={[styles.group, { backgroundColor: colors.surfaceMuted }]}
    >
      {options.map(({ value: optionValue, label: optionLabel, icon: Icon }) => {
        const selected = optionValue === value;
        return (
          <Pressable
            key={optionValue}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={optionLabel}
            onPress={() => onChange(optionValue)}
            style={[
              styles.option,
              selected && { backgroundColor: colors.surface, boxShadow: shadow.card },
            ]}
          >
            {Icon ? (
              <Icon size={16} color={selected ? colors.foreground : colors.foregroundMuted} />
            ) : null}
            <AppText
              variant="body-sm"
              tone={selected ? "default" : "muted"}
              style={styles.optionLabel}
            >
              {optionLabel}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { flexDirection: "row", borderRadius: 999, padding: 4, gap: 4 },
  option: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  optionLabel: { fontFamily: "Inter_500Medium" },
});

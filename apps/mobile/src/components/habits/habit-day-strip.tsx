import type { HabitDayStatus, ISODateString } from "@levelup/types";
import { APP_LOCALE, formatISODate } from "@levelup/utils";
import { Check } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/text";
import { alpha } from "@/theme/theme";
import { useTheme } from "@/theme/use-theme";

const statusWords: Record<HabitDayStatus, string> = {
  done: "done",
  missed: "missed",
  open: "not done yet",
  off: "not scheduled",
};

interface HabitDayStripProps {
  /** The days shown, oldest first; the last is today. */
  days: readonly ISODateString[];
  statuses: readonly HabitDayStatus[];
  /** Days before this can't be changed (the habit didn't exist yet). */
  start: ISODateString;
  onToggle: (day: ISODateString, done: boolean) => void;
}

/** The last seven days of a habit. Each day can be ticked or unticked. */
export function HabitDayStrip({ days, statuses, start, onToggle }: HabitDayStripProps) {
  const { colors } = useTheme();

  const circle = (status: HabitDayStatus) => {
    switch (status) {
      case "done":
        return { backgroundColor: colors.primary, borderColor: colors.primary };
      case "open":
        return { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 2 };
      case "missed":
        return { backgroundColor: colors.warningSubtle, borderColor: "transparent" };
      case "off":
        return {
          backgroundColor: "transparent",
          borderColor: colors.borderStrong,
          borderStyle: "dashed" as const,
        };
    }
  };

  return (
    <View style={styles.row}>
      {days.map((day, index) => {
        const status = statuses[index] ?? "off";
        const done = status === "done";
        const isToday = index === days.length - 1;
        const label = `${formatISODate(day, APP_LOCALE, { weekday: "long", day: "numeric", month: "long" })}${isToday ? ", today" : ""}: ${statusWords[status]}`;
        return (
          <Pressable
            key={day}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: done, disabled: day < start }}
            disabled={day < start}
            onPress={() => onToggle(day, !done)}
            style={[styles.day, day < start && { opacity: 0.4 }]}
          >
            <AppText variant="caption" tone={isToday ? "default" : "muted"}>
              {formatISODate(day, APP_LOCALE, { weekday: "narrow" })}
            </AppText>
            <View style={[styles.circle, circle(status)]}>
              {done ? (
                <Check size={16} color={colors.primaryForeground} strokeWidth={3} />
              ) : (
                <AppText
                  variant="body-sm"
                  tone={status === "missed" ? "warning" : "muted"}
                  style={{ color: status === "open" ? colors.foreground : undefined }}
                >
                  {Number(day.slice(8))}
                </AppText>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Explains the strip's colours once per screen. */
export function HabitDayLegend() {
  const { colors } = useTheme();
  const items: { label: string; style: object }[] = [
    { label: "Done", style: { backgroundColor: colors.primary } },
    { label: "Due today", style: { borderWidth: 2, borderColor: colors.primary } },
    { label: "Missed", style: { backgroundColor: alpha(colors.warning, 0.3) } },
    {
      label: "Not scheduled",
      style: { borderWidth: 1, borderStyle: "dashed", borderColor: colors.borderStrong },
    },
  ];
  return (
    <View style={styles.legend}>
      {items.map(({ label, style }) => (
        <View key={label} style={styles.legendItem}>
          <View style={[styles.swatch, style]} />
          <AppText variant="caption" tone="muted">
            {label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" },
  day: { alignItems: "center", gap: 4, minWidth: 40 },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  legend: { flexDirection: "row", flexWrap: "wrap", columnGap: 16, rowGap: 6 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  swatch: { width: 12, height: 12, borderRadius: 6 },
});

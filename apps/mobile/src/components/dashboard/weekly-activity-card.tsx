import { palette } from "@levelup/tokens";
import type { WeeklyActivity } from "@levelup/types";
import { APP_LOCALE, getWeekdayIndex, getWeekdayLabels, pluralize, sum } from "@levelup/utils";
import { ChartColumn, Table } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Sheet } from "@/components/ui/sheet";
import { AppText } from "@/components/ui/text";
import { useNow } from "@/lib/use-now";
import { useTheme } from "@/theme/use-theme";

import { DashboardCard } from "./dashboard-card";

const shortLabels = getWeekdayLabels(APP_LOCALE, "short");
const longLabels = getWeekdayLabels(APP_LOCALE, "long");
const PLOT_HEIGHT = 144;

type DayStatus = "past" | "today" | "upcoming";

interface Day {
  short: string;
  long: string;
  status: DayStatus;
  /** `null` for days that haven't happened yet. */
  value: number | null;
}

/** Rounds the axis up to an even number, with a floor so small weeks don't look huge. */
function niceMax(value: number): number {
  return Math.max(4, Math.ceil(value / 2) * 2);
}

function WeeklyActivityChart({
  completions,
  todayCompleted,
}: {
  completions: readonly number[];
  todayCompleted: number;
}) {
  const { colors, name } = useTheme();
  const todayIndex = getWeekdayIndex(useNow());
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [tableOpen, setTableOpen] = useState(false);

  const days: Day[] = shortLabels.map((short, index) => {
    const status: DayStatus =
      index < todayIndex ? "past" : index === todayIndex ? "today" : "upcoming";
    const value =
      status === "today" ? todayCompleted : status === "past" ? (completions[index] ?? 0) : null;
    return { short, long: longLabels[index] ?? short, status, value };
  });

  const known = days.flatMap((day) => (day.value === null ? [] : [day.value]));
  const total = sum(known);
  const scaleMax = niceMax(Math.max(0, ...known));
  const best = days.reduce<Day | null>(
    (top, day) => (day.value !== null && day.value > (top?.value ?? 0) ? day : top),
    null,
  );
  const selected = selectedIndex === null ? null : days[selectedIndex];
  const pastBarColor = name === "dark" ? palette.forest[300] : palette.forest[400];

  return (
    <View>
      {/* Visual only: the summary line and table expose every value to screen readers. */}
      <View
        style={styles.chart}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        {/* Y axis */}
        <View style={styles.yAxis}>
          {[scaleMax, scaleMax / 2, 0].map((tick) => (
            <AppText key={tick} variant="caption" tone="subtle" style={styles.tick}>
              {tick}
            </AppText>
          ))}
        </View>

        {/* Plot */}
        <View style={styles.plot}>
          <View style={[styles.gridline, { top: 0, backgroundColor: colors.border }]} />
          <View
            style={[styles.gridline, { top: PLOT_HEIGHT / 2, backgroundColor: colors.border }]}
          />
          <View style={[styles.gridline, { bottom: 0, backgroundColor: colors.borderStrong }]} />
          <View style={styles.columns}>
            {days.map((day, index) => {
              const height = day.value ? (day.value / scaleMax) * PLOT_HEIGHT : 0;
              const isToday = day.status === "today";
              const isSelected = selectedIndex === index;
              return (
                <Pressable
                  key={day.long}
                  disabled={day.status === "upcoming"}
                  onPress={() => setSelectedIndex(isSelected ? null : index)}
                  style={styles.column}
                >
                  {/* Direct label on today's cap only; other values: tap, or the table. */}
                  {isToday || isSelected ? (
                    <AppText variant="caption" style={styles.capLabel}>
                      {day.value}
                    </AppText>
                  ) : null}
                  {height > 0 ? (
                    <View
                      style={[
                        styles.bar,
                        {
                          height,
                          backgroundColor: isToday ? colors.primary : pastBarColor,
                          opacity: selectedIndex === null || isSelected ? 1 : 0.55,
                        },
                      ]}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* X axis */}
      <View
        style={styles.xAxis}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        {days.map((day) => (
          <AppText
            key={day.long}
            variant="caption"
            tone={
              day.status === "upcoming" ? "subtle" : day.status === "today" ? "default" : "muted"
            }
            style={[styles.xLabel, day.status === "today" && styles.bold]}
          >
            {day.short}
          </AppText>
        ))}
      </View>

      <AppText
        variant="body-sm"
        tone="muted"
        style={styles.summary}
        accessibilityLiveRegion="polite"
      >
        {selected ? (
          <AppText variant="body-sm" style={styles.bold}>
            {selected.long}: {pluralize(selected.value ?? 0, "completion")}
          </AppText>
        ) : (
          <>
            <AppText variant="body-sm" style={styles.bold}>
              {pluralize(total, "completion")}
            </AppText>{" "}
            so far this week{best ? ` · best day ${best.long} (${best.value})` : ""}
          </>
        )}
      </AppText>

      <Button
        label="View as table"
        variant="ghost"
        size="sm"
        icon={Table}
        onPress={() => setTableOpen(true)}
        style={styles.tableButton}
      />

      <Sheet
        open={tableOpen}
        onClose={() => setTableOpen(false)}
        title="This week"
        description="Priorities and habits completed each day"
      >
        {days.map((day, index) => (
          <View
            key={day.long}
            accessible
            accessibilityLabel={`${day.long}${day.status === "today" ? ", today" : ""}: ${
              day.value === null ? "upcoming" : pluralize(day.value, "completion")
            }`}
            style={[
              styles.tableRow,
              index > 0 && {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.border,
              },
            ]}
          >
            <AppText variant="body">
              {day.long}
              {day.status === "today" ? " (today)" : ""}
            </AppText>
            <AppText variant="body" style={styles.tableValue}>
              {day.value ?? "—"}
            </AppText>
          </View>
        ))}
      </Sheet>
    </View>
  );
}

interface WeeklyActivityCardProps {
  activity: WeeklyActivity | null;
  todayCompleted: number;
  isDemo: boolean;
}

export function WeeklyActivityCard({ activity, todayCompleted, isDemo }: WeeklyActivityCardProps) {
  return (
    <DashboardCard
      title="Weekly activity"
      description="Priorities and habits completed each day"
      isDemo={isDemo}
    >
      {activity ? (
        <WeeklyActivityChart completions={activity.completions} todayCompleted={todayCompleted} />
      ) : (
        <EmptyState
          icon={ChartColumn}
          title="No activity yet"
          description="Every priority and habit you complete appears here, so you can watch your week take shape."
        />
      )}
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  chart: { flexDirection: "row", gap: 8 },
  yAxis: { width: 20, height: PLOT_HEIGHT, justifyContent: "space-between" },
  tick: { textAlign: "right", fontVariant: ["tabular-nums"], marginVertical: -8 },
  plot: { flex: 1, height: PLOT_HEIGHT },
  gridline: { position: "absolute", left: 0, right: 0, height: StyleSheet.hairlineWidth },
  columns: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: "row",
    gap: 6,
  },
  column: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  capLabel: { fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  // Columns cap at 24px with a 4px rounded data end and a square baseline.
  bar: { width: "70%", maxWidth: 24, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  xAxis: { flexDirection: "row", gap: 6, marginTop: 8, marginLeft: 28 },
  xLabel: { flex: 1, textAlign: "center" },
  bold: { fontFamily: "Inter_600SemiBold" },
  summary: { marginTop: 14 },
  tableButton: { marginTop: 6, marginLeft: -12 },
  tableRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12 },
  tableValue: { fontVariant: ["tabular-nums"], fontFamily: "Inter_600SemiBold" },
});

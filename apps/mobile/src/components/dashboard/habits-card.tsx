import type { HabitSummary } from "@levelup/types";
import { pluralize } from "@levelup/utils";
import { Check, Flame, Repeat } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AppText } from "@/components/ui/text";
import { alpha } from "@/theme/theme";
import { useTheme } from "@/theme/use-theme";

import { DashboardCard } from "./dashboard-card";

/** Seven dots, oldest first; the last dot is today. */
function RecentDays({
  days,
  completedToday,
}: {
  days: readonly boolean[];
  completedToday: boolean;
}) {
  const { colors } = useTheme();
  const completed = days.filter(Boolean).length;
  return (
    <View
      accessible
      accessibilityLabel={`Completed on ${completed} of the last ${days.length} days`}
      style={styles.dots}
    >
      {days.map((isDone, index) => {
        const pendingToday = index === days.length - 1 && !completedToday;
        return (
          <View
            // Position is the identity: a fixed seven-day window.
            key={index}
            style={[
              styles.dot,
              pendingToday
                ? { borderWidth: 1.5, borderColor: colors.foregroundSubtle }
                : { backgroundColor: isDone ? colors.primary : alpha(colors.primary, 0.15) },
            ]}
          />
        );
      })}
    </View>
  );
}

export function HabitsCard({
  habits,
  isDemo,
}: {
  habits: readonly HabitSummary[];
  isDemo: boolean;
}) {
  const { colors } = useTheme();
  const due = habits.filter((habit) => habit.dueToday);
  const done = due.filter((habit) => habit.completedToday).length;
  const hasHabits = habits.length > 0;

  return (
    <DashboardCard
      title="Habits"
      description={
        hasHabits ? `${done} of ${due.length} done today` : "Small daily actions that compound"
      }
      isDemo={isDemo}
      footerLink={hasHabits ? { href: "/habits", label: "All habits" } : undefined}
    >
      {hasHabits ? (
        <View>
          {habits.map((habit, index) => (
            <View
              key={habit.id}
              style={[
                styles.row,
                index > 0 && {
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.status,
                  { backgroundColor: habit.completedToday ? colors.accent : colors.surfaceMuted },
                ]}
              >
                {habit.completedToday ? (
                  <Check size={20} color={colors.accentForeground} strokeWidth={2.5} />
                ) : (
                  <Repeat size={16} color={colors.foregroundSubtle} />
                )}
              </View>
              <View
                style={styles.copy}
                accessible
                accessibilityLabel={`${habit.name}, ${
                  habit.completedToday
                    ? "done today"
                    : habit.dueToday
                      ? "not done yet today"
                      : "not due today"
                }, ${habit.currentStreak > 0 ? `${pluralize(habit.currentStreak, "day")} streak` : "no streak yet"}`}
              >
                <AppText variant="label" numberOfLines={1}>
                  {habit.name}
                </AppText>
                <View style={styles.streak}>
                  <Flame
                    size={14}
                    color={habit.currentStreak > 0 ? colors.warning : colors.foregroundSubtle}
                  />
                  <AppText variant="caption" tone="muted">
                    {habit.currentStreak > 0
                      ? `${pluralize(habit.currentStreak, "day")} streak`
                      : "No streak yet"}
                  </AppText>
                </View>
              </View>
              <RecentDays days={habit.recentDays} completedToday={habit.completedToday} />
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          icon={Repeat}
          title="No habits yet"
          description="Start with one habit small enough to do on your worst day. Consistency beats intensity."
          action={<ButtonLink href="/habits" label="Explore Habits" size="sm" />}
        />
      )}
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  status: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1, gap: 2 },
  streak: { flexDirection: "row", alignItems: "center", gap: 4 },
  dots: { flexDirection: "row", gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});

import type { GoalSummary } from "@levelup/types";
import { APP_LOCALE, formatMonthYear, toPercent } from "@levelup/utils";
import { Target } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress";
import { AppText } from "@/components/ui/text";

import { DashboardCard } from "./dashboard-card";

export function GoalsCard({ goals, isDemo }: { goals: readonly GoalSummary[]; isDemo: boolean }) {
  const active = goals.filter((goal) => goal.status === "active");
  const hasGoals = active.length > 0;

  return (
    <DashboardCard
      title="Active goals"
      description={hasGoals ? `${active.length} in progress` : "Where you're heading"}
      isDemo={isDemo}
      footerLink={hasGoals ? { href: "/goals", label: "All goals" } : undefined}
    >
      {hasGoals ? (
        <View style={styles.list}>
          {active.map((goal) => {
            const { completed, total } = goal.milestones;
            return (
              <View key={goal.id}>
                <View style={styles.titleRow}>
                  <AppText variant="label" numberOfLines={1} style={styles.title}>
                    {goal.title}
                  </AppText>
                  <AppText variant="label" style={styles.percent}>
                    {toPercent(goal.milestones)}%
                  </AppText>
                </View>
                <ProgressBar
                  value={completed}
                  max={total}
                  label={`${goal.title} progress`}
                  valueText={`${completed} of ${total} milestones`}
                  style={styles.bar}
                />
                <AppText variant="caption" tone="muted">
                  {completed} of {total} milestones
                  {goal.targetDate
                    ? ` · Target ${formatMonthYear(goal.targetDate, APP_LOCALE)}`
                    : ""}
                </AppText>
              </View>
            );
          })}
        </View>
      ) : (
        <EmptyState
          icon={Target}
          title="No active goals"
          description="Set a meaningful goal and break it into milestones you can see yourself reach."
          action={<ButtonLink href="/goals" label="Explore Goals" size="sm" />}
        />
      )}
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  list: { gap: 18 },
  titleRow: { flexDirection: "row", alignItems: "baseline", gap: 12 },
  title: { flex: 1 },
  percent: { fontFamily: "Inter_600SemiBold" },
  bar: { marginTop: 8, marginBottom: 6 },
});

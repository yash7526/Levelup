import type { TodayProgress } from "@levelup/utils";
import { ArrowRight } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { ButtonLink } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress";
import { AppText } from "@/components/ui/text";
import { alpha } from "@/theme/theme";
import { useTheme } from "@/theme/use-theme";

import { DashboardCard } from "./dashboard-card";

function Breakdown({
  label,
  completed,
  total,
}: {
  label: string;
  completed: number;
  total: number;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.breakdown, { backgroundColor: alpha(colors.brandForeground, 0.08) }]}>
      <AppText variant="caption" tone="onBrandMuted">
        {label}
      </AppText>
      <AppText variant="body" tone="onBrand" style={styles.breakdownValue}>
        {total === 0 ? "None set" : `${completed} of ${total}`}
      </AppText>
    </View>
  );
}

export function TodayProgressCard({
  progress,
  isDemo,
}: {
  progress: TodayProgress;
  isDemo: boolean;
}) {
  const { overall, percent } = progress;
  const hasPlan = overall.total > 0;

  return (
    <DashboardCard
      title="Today's progress"
      description={hasPlan ? "Priorities and habits due today" : "Nothing planned yet"}
      variant="brand"
      isDemo={isDemo}
    >
      <View style={styles.body}>
        <ProgressRing
          value={overall.completed}
          max={Math.max(overall.total, 1)}
          label="Today's progress"
          valueText={
            hasPlan ? `${overall.completed} of ${overall.total} done` : "Nothing planned yet"
          }
          tone="onBrand"
          size={136}
          strokeWidth={11}
        >
          <View style={styles.figure}>
            <View style={styles.percentRow}>
              <AppText tone="onBrand" style={styles.percent}>
                {percent}
              </AppText>
              <AppText variant="heading-3" tone="onBrandMuted">
                %
              </AppText>
            </View>
            <AppText variant="caption" tone="onBrandMuted">
              {hasPlan ? `${overall.completed} of ${overall.total}` : "complete"}
            </AppText>
          </View>
        </ProgressRing>

        {hasPlan ? (
          <View style={styles.breakdowns}>
            <Breakdown label="Priorities" {...progress.priorities} />
            <Breakdown label="Habits" {...progress.habits} />
          </View>
        ) : (
          <AppText variant="body-sm" tone="onBrandMuted" style={styles.empty}>
            Set today&apos;s priorities or start a habit, and your progress will appear here as you
            complete them.
          </AppText>
        )}

        <ButtonLink
          href="/today"
          label={hasPlan ? "Open today's plan" : "Plan today"}
          variant="accent"
          size="sm"
          icon={ArrowRight}
          iconPosition="end"
          style={styles.cta}
        />
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  body: { alignItems: "center", gap: 18 },
  figure: { alignItems: "center" },
  percentRow: { flexDirection: "row", alignItems: "baseline" },
  // Headline figure: the UI sans, proportional numerals (never the display face).
  percent: { fontFamily: "Inter_600SemiBold", fontSize: 40, lineHeight: 44, letterSpacing: -1 },
  breakdowns: { flexDirection: "row", gap: 8, alignSelf: "stretch" },
  breakdown: { flex: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, gap: 2 },
  breakdownValue: { fontFamily: "Inter_600SemiBold" },
  empty: { textAlign: "center" },
  cta: { alignSelf: "center" },
});

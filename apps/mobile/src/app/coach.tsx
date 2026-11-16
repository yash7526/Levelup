import type { CoachFocus, CoachInsight } from "@levelup/types";
import { buildCoachReport, pluralize } from "@levelup/utils";
import type { Href } from "expo-router";
import {
  CalendarCheck,
  Lightbulb,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react-native";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { ActionError } from "@/components/growth/action-error";
import { Screen } from "@/components/layout/screen";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AppText } from "@/components/ui/text";
import { useGrowth } from "@/providers/growth";
import { usePlanning } from "@/providers/planning";
import { alpha } from "@/theme/theme";
import { useTheme } from "@/theme/use-theme";

const focusRoutes: Record<CoachFocus, { href: Href; label: string }> = {
  today: { href: "/today", label: "Open Today" },
  habits: { href: "/habits", label: "Open Habits" },
  goals: { href: "/goals", label: "Open Goals" },
  learning: { href: "/learning", label: "Open Learning" },
};

function InsightCard({ insight }: { insight: CoachInsight }) {
  const { colors } = useTheme();
  const tone = insight.tone ?? "info";
  const meta = {
    celebrate: { icon: PartyPopper, color: colors.success, label: "Win", badge: "success" },
    nudge: {
      icon: TriangleAlert,
      color: colors.warning,
      label: "Needs attention",
      badge: "warning",
    },
    info: { icon: Lightbulb, color: colors.foregroundMuted, label: "Idea", badge: "neutral" },
  } satisfies Record<
    string,
    { icon: typeof Lightbulb; color: string; label: string; badge: BadgeVariant }
  >;
  const { icon: Icon, color, label, badge } = meta[tone];
  const focus = insight.focus ? focusRoutes[insight.focus] : null;

  return (
    <Card style={styles.insight}>
      <View style={[styles.tile, { backgroundColor: alpha(color, 0.14) }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.flex}>
        <Badge label={label} variant={badge} />
        <AppText style={styles.message}>{insight.message}</AppText>
        {insight.suggestion ? (
          <AppText variant="body-sm" tone="muted" style={styles.suggestion}>
            <AppText variant="body-sm" style={styles.bold}>
              Next step:{" "}
            </AppText>
            {insight.suggestion}
          </AppText>
        ) : null}
        {focus ? (
          <ButtonLink href={focus.href} label={focus.label} variant="outline" size="sm" />
        ) : null}
      </View>
    </Card>
  );
}

function WeekRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.weekRow} accessible accessibilityLabel={`${label}: ${value}`}>
      <AppText variant="body-sm" tone="muted">
        {label}
      </AppText>
      <AppText variant="body-sm" style={styles.bold}>
        {value}
      </AppText>
    </View>
  );
}

export default function CoachScreen() {
  const { colors } = useTheme();
  const growth = useGrowth();
  const planning = usePlanning();

  const report = useMemo(
    () => (growth.data ? buildCoachReport(growth.data, planning.data, growth.toLocalDay) : null),
    [growth.data, growth.toLocalDay, planning.data],
  );

  const refresh = () => void Promise.all([growth.refresh(), planning.refresh()]);

  if (!growth.available) {
    return (
      <Screen kind="stack">
        <Card>
          <EmptyState
            icon={Sparkles}
            title="Accounts aren't set up"
            description="The coach reads your habits, goals, learning and priorities, which are saved to your LevelUp account. This build has no Supabase settings."
          />
        </Card>
      </Screen>
    );
  }

  if (!report) {
    return (
      <Screen kind="stack" onRefresh={refresh} refreshing={growth.refreshing}>
        <Card>
          <EmptyState
            icon={Sparkles}
            title={growth.loadError ? "Couldn't load your data" : "Loading…"}
            description={
              growth.loadError ??
              "The coach is reading your habits, goals, learning and priorities."
            }
            action={
              growth.loadError ? (
                <Button label="Try again" onPress={refresh} loading={growth.refreshing} />
              ) : undefined
            }
          />
        </Card>
      </Screen>
    );
  }

  const { week } = report;
  const hasWeek =
    week.priorities.total > 0 ||
    week.habitCheckins > 0 ||
    week.habitDays.total > 0 ||
    week.learningMinutes > 0 ||
    week.milestonesCompleted > 0;

  return (
    <Screen kind="stack" onRefresh={refresh} refreshing={growth.refreshing || planning.refreshing}>
      <AppText variant="body-lg" tone="muted">
        Guidance grounded in your own habits, goals, learning and priorities.
      </AppText>

      {planning.loadError ? (
        <ActionError
          message={`${planning.loadError} Until goals and learning load, the coach is only looking at your habits and priorities.`}
          onDismiss={() => undefined}
        />
      ) : null}

      <AppText variant="overline" tone="muted" accessibilityRole="header">
        What the coach noticed
      </AppText>
      {report.insights.length > 0 ? (
        report.insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)
      ) : (
        <Card>
          <EmptyState
            icon={Sparkles}
            title="Nothing to point out"
            description="The coach looks at what you track. Add a habit, a goal or a priority and it will have something to say."
          />
        </Card>
      )}

      <Card>
        <View style={styles.titleRow}>
          <CalendarCheck size={20} color={colors.primary} />
          <AppText variant="heading-3" accessibilityRole="header">
            This week so far
          </AppText>
        </View>
        <AppText variant="body-sm" tone="muted" style={styles.sub}>
          Monday through today, from your records.
        </AppText>
        {hasWeek ? (
          <View style={styles.weekList}>
            <WeekRow
              label="Priorities done"
              value={`${week.priorities.completed} of ${week.priorities.total}`}
            />
            <WeekRow
              label="Scheduled habit days done"
              value={
                week.habitDays.total > 0
                  ? `${week.habitDays.completed} of ${week.habitDays.total}`
                  : "None scheduled"
              }
            />
            <WeekRow label="Habit check-ins" value={String(week.habitCheckins)} />
            <WeekRow label="Milestones reached" value={String(week.milestonesCompleted)} />
            <WeekRow
              label="Time studying"
              value={
                week.learningMinutes > 0 ? pluralize(week.learningMinutes, "minute") : "None yet"
              }
            />
          </View>
        ) : (
          <AppText variant="body-sm" tone="muted">
            Nothing recorded this week yet.
          </AppText>
        )}
      </Card>

      <Card variant="muted">
        <View style={styles.titleRow}>
          <ShieldCheck size={20} color={colors.primary} />
          <AppText variant="heading-3" accessibilityRole="header">
            How the coach works
          </AppText>
        </View>
        <AppText variant="body-sm" tone="muted" style={styles.sub}>
          These insights come from simple, transparent rules applied to your own records: your
          streaks, target dates, progress and study sessions. Each message states the numbers it is
          based on. There is no language model, and your data isn&apos;t sent anywhere to produce
          them.
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, alignItems: "flex-start", gap: 4 },
  insight: { flexDirection: "row", gap: 14 },
  tile: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  message: { marginTop: 4 },
  suggestion: { marginBottom: 6 },
  bold: { fontFamily: "Inter_600SemiBold" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sub: { marginTop: 4, marginBottom: 4 },
  weekList: { gap: 10, marginTop: 8 },
  weekRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
});

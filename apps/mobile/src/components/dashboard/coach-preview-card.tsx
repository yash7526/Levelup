import type { CoachInsight } from "@levelup/types";
import { coachCapabilities } from "@levelup/utils";
import { ArrowRight, Lightbulb, Sparkles } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { AppText } from "@/components/ui/text";
import { useTheme } from "@/theme/use-theme";

import { DashboardCard } from "./dashboard-card";

export function CoachPreviewCard({
  insight,
  isDemo,
}: {
  insight: CoachInsight | null;
  isDemo: boolean;
}) {
  const { colors } = useTheme();

  return (
    <DashboardCard
      title="AI Coach"
      description="Personal guidance, grounded in your progress"
      isDemo={isDemo}
      badge={<Badge label="Coming soon" variant="accent" />}
    >
      <View style={styles.body}>
        {insight ? (
          <View style={[styles.insight, { backgroundColor: colors.surfaceMuted }]}>
            <View style={styles.insightHeader}>
              <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
                <Sparkles size={14} color={colors.accentForeground} />
              </View>
              <AppText variant="caption" tone="muted">
                Coach insight
              </AppText>
            </View>
            <AppText variant="body">{insight.message}</AppText>
            {insight.suggestion ? (
              <View style={[styles.suggestion, { backgroundColor: colors.surface }]}>
                <Lightbulb size={16} color={colors.warning} />
                <AppText variant="body-sm" style={styles.suggestionText}>
                  <AppText variant="body-sm" style={styles.bold}>
                    Next step:{" "}
                  </AppText>
                  {insight.suggestion}
                </AppText>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.capabilities}>
            {coachCapabilities.map((capability) => (
              <View key={capability} style={styles.capability}>
                <Sparkles size={16} color={colors.primary} />
                <AppText variant="body-sm" tone="muted" style={styles.capabilityText}>
                  {capability}
                </AppText>
              </View>
            ))}
          </View>
        )}
        <ButtonLink
          href="/coach"
          label="Meet your coach"
          variant="outline"
          size="sm"
          icon={ArrowRight}
          iconPosition="end"
        />
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  body: { gap: 16 },
  insight: { borderRadius: 20, padding: 16, gap: 12 },
  insightHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestion: { flexDirection: "row", gap: 8, borderRadius: 12, padding: 12 },
  suggestionText: { flex: 1 },
  bold: { fontFamily: "Inter_600SemiBold" },
  capabilities: { gap: 10 },
  capability: { flexDirection: "row", gap: 10 },
  capabilityText: { flex: 1 },
});

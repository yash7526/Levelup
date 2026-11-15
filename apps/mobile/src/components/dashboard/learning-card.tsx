import type { LearningItemSummary, LearningKind } from "@levelup/types";
import { learningKindLabels } from "@levelup/utils";
import { BookOpen, CirclePlay, FileText, GraduationCap, Sparkle } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { IconComponent } from "@/components/ui/icon";
import { ProgressBar } from "@/components/ui/progress";
import { AppText } from "@/components/ui/text";
import { useTheme } from "@/theme/use-theme";

import { DashboardCard } from "./dashboard-card";

const kindIcons: Record<LearningKind, IconComponent> = {
  course: CirclePlay,
  book: BookOpen,
  skill: Sparkle,
  article: FileText,
};

export function LearningCard({
  items,
  isDemo,
}: {
  items: readonly LearningItemSummary[];
  isDemo: boolean;
}) {
  const { colors } = useTheme();
  const hasItems = items.length > 0;

  return (
    <DashboardCard
      title="Learning"
      description={hasItems ? `${items.length} in progress` : "Courses, books and skills"}
      isDemo={isDemo}
      footerLink={hasItems ? { href: "/learning", label: "Library" } : undefined}
    >
      {hasItems ? (
        <View style={styles.list}>
          {items.map((item) => {
            const Icon = kindIcons[item.kind];
            const { completed, total } = item.progress;
            return (
              <View key={item.id} style={styles.item}>
                <View style={[styles.icon, { backgroundColor: colors.surfaceMuted }]}>
                  <Icon size={18} color={colors.foregroundMuted} />
                </View>
                <View style={styles.copy}>
                  <AppText variant="label" numberOfLines={1}>
                    {item.title}
                  </AppText>
                  <AppText variant="caption" tone="muted">
                    {learningKindLabels[item.kind]} · {completed} of {total} {item.unit}
                  </AppText>
                  <ProgressBar
                    value={completed}
                    max={total}
                    size="sm"
                    label={`${item.title} progress`}
                    valueText={`${completed} of ${total} ${item.unit}`}
                    style={styles.bar}
                  />
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <EmptyState
          icon={GraduationCap}
          title="Nothing in progress"
          description="Track the courses, books and skills you're working through, one session at a time."
          action={<ButtonLink href="/learning" label="Explore Learning" size="sm" />}
        />
      )}
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  list: { gap: 16 },
  item: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1, gap: 2 },
  bar: { marginTop: 6 },
});

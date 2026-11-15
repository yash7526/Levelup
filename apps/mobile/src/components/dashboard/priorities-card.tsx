import type { Priority } from "@levelup/types";
import { lifeAreaLabels } from "@levelup/utils";
import { Circle, CircleCheck, ListChecks } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AppText } from "@/components/ui/text";
import { alpha } from "@/theme/theme";
import { useTheme } from "@/theme/use-theme";

import { DashboardCard } from "./dashboard-card";

export function PrioritiesCard({
  priorities,
  isDemo,
}: {
  priorities: readonly Priority[];
  isDemo: boolean;
}) {
  const { colors } = useTheme();
  const done = priorities.filter((priority) => priority.status === "done").length;
  const hasPriorities = priorities.length > 0;

  return (
    <DashboardCard
      title="Today's priorities"
      description={
        hasPriorities
          ? `${done} of ${priorities.length} complete`
          : "The few things that would make today a win"
      }
      isDemo={isDemo}
      footerLink={hasPriorities ? { href: "/today", label: "Open Today" } : undefined}
    >
      {hasPriorities ? (
        <View style={styles.list}>
          {priorities.map((priority) => {
            const isDone = priority.status === "done";
            const Icon = isDone ? CircleCheck : Circle;
            return (
              <View
                key={priority.id}
                accessible
                accessibilityLabel={`${priority.title}, ${isDone ? "done" : "to do"}`}
                style={[styles.item, { backgroundColor: alpha(colors.surfaceMuted, 0.7) }]}
              >
                <Icon size={20} color={isDone ? colors.success : colors.foregroundSubtle} />
                <AppText
                  variant="body"
                  tone={isDone ? "muted" : "default"}
                  style={[styles.title, isDone && styles.done]}
                >
                  {priority.title}
                </AppText>
                {priority.area ? <Badge label={lifeAreaLabels[priority.area]} /> : null}
              </View>
            );
          })}
        </View>
      ) : (
        <EmptyState
          icon={ListChecks}
          title="No priorities yet"
          description="Choose up to three things that matter most today. Fewer priorities, more follow-through."
          action={<ButtonLink href="/today" label="Go to Today" size="sm" />}
        />
      )}
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 56,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: { flex: 1 },
  done: { textDecorationLine: "line-through" },
});

import type { GrowthData, Habit, ISODateString } from "@levelup/types";
import {
  describeSchedule,
  describeStreak,
  HABIT_HISTORY_DAYS,
  lastDays,
  lifeAreaLabels,
  summarizeHabits,
} from "@levelup/utils";
import { Archive, ArchiveRestore, Flame, Pencil, Plus, Repeat } from "lucide-react-native";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { ActionError } from "@/components/growth/action-error";
import { CheckToggle } from "@/components/growth/check-toggle";
import { GrowthGate } from "@/components/growth/growth-gate";
import { HabitDayLegend, HabitDayStrip } from "@/components/habits/habit-day-strip";
import { HabitFormSheet } from "@/components/habits/habit-form-sheet";
import { PageHeader, Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { Sheet } from "@/components/ui/sheet";
import { AppText } from "@/components/ui/text";
import { useGrowth } from "@/providers/growth";
import { useTheme } from "@/theme/use-theme";

type Editor = { habit: Habit | null; key: number } | null;

function HabitsBoard({ data }: { data: GrowthData }) {
  const { colors } = useTheme();
  const growth = useGrowth();
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<Editor>(null);
  const [toArchive, setToArchive] = useState<Habit | null>(null);
  const [archiving, setArchiving] = useState(false);

  const days = useMemo(() => lastDays(growth.today, HABIT_HISTORY_DAYS), [growth.today]);
  const active = useMemo(() => data.habits.filter((h) => h.archivedAt === null), [data.habits]);
  const archived = data.habits.filter((h) => h.archivedAt !== null);
  const summaries = useMemo(
    () => summarizeHabits(active, data.checkins, growth.today, growth.toLocalDay),
    [active, data.checkins, growth.today, growth.toLocalDay],
  );

  const toggle = (id: string, day: ISODateString, done: boolean) =>
    void growth.setCheckin(id, day, done).then(setError);

  async function confirmArchive() {
    if (!toArchive) return;
    setArchiving(true);
    const message = await growth.setArchived(toArchive.id, true);
    setArchiving(false);
    if (message) setError(message);
    setToArchive(null);
  }

  return (
    <>
      <ActionError message={error} onDismiss={() => setError(null)} />

      {active.length === 0 ? (
        <Card>
          <EmptyState
            icon={Repeat}
            title="No habits yet"
            description="Start with one habit small enough to do on your worst day. Consistency beats intensity."
            action={
              <Button
                label="Create your first habit"
                icon={Plus}
                onPress={() => setEditor({ habit: null, key: Date.now() })}
              />
            }
          />
        </Card>
      ) : (
        <>
          <Button
            label="New habit"
            icon={Plus}
            onPress={() => setEditor({ habit: null, key: Date.now() })}
          />
          <HabitDayLegend />
          {active.map((habit, index) => {
            const summary = summaries[index];
            if (!summary) return null;
            const start = growth.toLocalDay(habit.createdAt);
            const shown = summary;
            return (
              <Card key={habit.id} style={styles.card}>
                <View style={styles.head}>
                  <CheckToggle
                    size="lg"
                    checked={shown.completedToday}
                    label={`${habit.name}, done today`}
                    onToggle={() => toggle(habit.id, growth.today, !shown.completedToday)}
                  />
                  <View style={styles.flex}>
                    <AppText variant="label" numberOfLines={1}>
                      {habit.name}
                    </AppText>
                    <AppText variant="caption" tone="muted">
                      {describeSchedule(habit.schedule)}
                      {habit.area ? ` · ${lifeAreaLabels[habit.area]}` : ""}
                    </AppText>
                    <View style={styles.streak}>
                      <Flame
                        size={14}
                        color={shown.currentStreak > 0 ? colors.warning : colors.foregroundSubtle}
                      />
                      <AppText variant="caption" tone="muted">
                        {describeStreak(shown)}
                        {shown.weekProgress
                          ? ` · ${shown.weekProgress.completed} of ${shown.weekProgress.total} this week`
                          : ""}
                      </AppText>
                    </View>
                  </View>
                  <IconButton
                    icon={Pencil}
                    label={`Edit ${habit.name}`}
                    onPress={() => setEditor({ habit, key: Date.now() })}
                  />
                  <IconButton
                    icon={Archive}
                    label={`Archive ${habit.name}`}
                    onPress={() => setToArchive(habit)}
                  />
                </View>
                <HabitDayStrip
                  days={days}
                  statuses={shown.recentDays}
                  start={start}
                  onToggle={(day, done) => toggle(habit.id, day, done)}
                />
              </Card>
            );
          })}
        </>
      )}

      {archived.length > 0 ? (
        <Card variant="outline">
          <AppText variant="label">Archived habits ({archived.length})</AppText>
          {archived.map((habit) => (
            <View key={habit.id} style={styles.archivedRow}>
              <View style={styles.flex}>
                <AppText numberOfLines={1}>{habit.name}</AppText>
                <AppText variant="caption" tone="muted">
                  {describeSchedule(habit.schedule)}
                </AppText>
              </View>
              <Button
                label="Restore"
                variant="outline"
                size="sm"
                icon={ArchiveRestore}
                onPress={() => void growth.setArchived(habit.id, false).then(setError)}
              />
            </View>
          ))}
        </Card>
      ) : null}

      {editor ? (
        <HabitFormSheet key={editor.key} habit={editor.habit} onClose={() => setEditor(null)} />
      ) : null}

      <Sheet
        open={toArchive !== null}
        onClose={() => setToArchive(null)}
        title={toArchive ? `Archive ${toArchive.name}?` : "Archive habit?"}
        description="It leaves Today and your dashboard. Its history is kept, and you can restore it from Archived habits."
      >
        <View style={styles.confirm}>
          <Button label="Cancel" variant="outline" onPress={() => setToArchive(null)} />
          <Button
            label="Archive habit"
            variant="danger"
            loading={archiving}
            onPress={() => void confirmArchive()}
          />
        </View>
      </Sheet>
    </>
  );
}

export default function HabitsScreen() {
  const { refresh, refreshing } = useGrowth();
  return (
    <Screen kind="tab" onRefresh={() => void refresh()} refreshing={refreshing}>
      <PageHeader
        title="Habits"
        description="Small, repeatable actions that compound into who you become."
      />
      <GrowthGate icon={Repeat}>{(data) => <HabitsBoard data={data} />}</GrowthGate>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { gap: 16 },
  head: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  streak: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  archivedRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12 },
  confirm: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
});

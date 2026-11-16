import type { GrowthData, LifeArea } from "@levelup/types";
import {
  APP_LOCALE,
  describeSchedule,
  describeStreak,
  formatISODate,
  lifeAreaLabels,
  MAX_PRIORITIES_PER_DAY,
  parsePriorityTitle,
  PRIORITY_TITLE_MAX_LENGTH,
  prioritiesForDay,
  summarizeTodayProgress,
} from "@levelup/utils";
import { ArrowUp, ListChecks, Moon, Plus, Repeat, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { ActionError } from "@/components/growth/action-error";
import { AreaPicker } from "@/components/growth/area-picker";
import { CheckToggle } from "@/components/growth/check-toggle";
import { GrowthGate } from "@/components/growth/growth-gate";
import { PageHeader, Screen } from "@/components/layout/screen";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { AppText } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";
import { useGrowth } from "@/providers/growth";
import { alpha } from "@/theme/theme";
import { useTheme } from "@/theme/use-theme";

function AddPriority({ slotsLeft, onError }: { slotsLeft: number; onError: (m: string) => void }) {
  const { addPriority } = useGrowth();
  const [title, setTitle] = useState("");
  const [area, setArea] = useState<LifeArea | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  async function submit() {
    const parsed = parsePriorityTitle(title);
    if (!parsed.ok) {
      setFieldError(parsed.error);
      return;
    }
    setFieldError(undefined);
    setSaving(true);
    const error = await addPriority(parsed.value, area);
    setSaving(false);
    if (error) onError(error);
    else {
      setTitle("");
      setArea(null);
    }
  }

  return (
    <View style={styles.form}>
      <TextField
        label="Add a priority"
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          setFieldError(undefined);
        }}
        placeholder="What would make today a win?"
        maxLength={PRIORITY_TITLE_MAX_LENGTH}
        returnKeyType="done"
        onSubmitEditing={() => void submit()}
        hint={`${slotsLeft} of ${MAX_PRIORITIES_PER_DAY} slots left today.`}
        error={fieldError}
      />
      <AreaPicker value={area} onChange={setArea} />
      <Button label="Add priority" icon={Plus} loading={saving} onPress={() => void submit()} />
    </View>
  );
}

function Planner({ data }: { data: GrowthData }) {
  const { colors } = useTheme();
  const growth = useGrowth();
  const [error, setError] = useState<string | null>(null);

  const priorities = prioritiesForDay(data.priorities, growth.today);
  const slotsLeft = Math.max(0, MAX_PRIORITIES_PER_DAY - priorities.length);
  const progress = summarizeTodayProgress(priorities, growth.habits);
  const dueHabits = growth.habits.filter((habit) => habit.dueToday || habit.completedToday);

  const report = (message: string | null) => setError(message);

  return (
    <>
      <ActionError message={error} onDismiss={() => setError(null)} />

      <Card style={styles.progress}>
        <View style={styles.flex}>
          <AppText variant="heading-3">
            {progress.overall.total === 0
              ? "Nothing planned yet"
              : `${progress.overall.completed} of ${progress.overall.total} done`}
          </AppText>
          <AppText variant="body-sm" tone="muted">
            Priorities {progress.priorities.completed} of {progress.priorities.total} · Habits due{" "}
            {progress.habits.completed} of {progress.habits.total}
          </AppText>
        </View>
        <AppText variant="heading-2" tone="primary">
          {progress.percent}%
        </AppText>
      </Card>

      <Card>
        <AppText variant="heading-3" accessibilityRole="header">
          Priorities
        </AppText>
        <AppText variant="body-sm" tone="muted" style={styles.sub}>
          {priorities.length === 0
            ? "Up to three things that would make today a win."
            : `${progress.priorities.completed} of ${priorities.length} complete`}
        </AppText>

        {priorities.length > 0 ? (
          <View style={styles.list}>
            {priorities.map((priority) => {
              const done = priority.status === "done";
              return (
                <View
                  key={priority.id}
                  style={[styles.row, { backgroundColor: alpha(colors.surfaceMuted, 0.7) }]}
                >
                  <CheckToggle
                    checked={done}
                    label={priority.title}
                    onToggle={() => void growth.setPriorityDone(priority.id, !done).then(report)}
                  />
                  <AppText
                    tone={done ? "muted" : "default"}
                    style={[styles.flex, done && styles.struck]}
                  >
                    {priority.title}
                  </AppText>
                  {priority.area ? <Badge label={lifeAreaLabels[priority.area]} /> : null}
                  <IconButton
                    icon={Trash2}
                    label={`Remove ${priority.title}`}
                    onPress={() => void growth.removePriority(priority.id).then(report)}
                  />
                </View>
              );
            })}
          </View>
        ) : (
          <EmptyState
            icon={ListChecks}
            title="No priorities yet"
            description="Fewer priorities, more follow-through. Start with the one thing that matters most."
          />
        )}

        {slotsLeft > 0 ? (
          <AddPriority slotsLeft={slotsLeft} onError={setError} />
        ) : (
          <AppText variant="body-sm" tone="muted" style={styles.full}>
            That&apos;s three priorities, today&apos;s limit. Finish or remove one to add another.
          </AppText>
        )}
      </Card>

      {data.carryOver.length > 0 ? (
        <Card>
          <AppText variant="heading-3" accessibilityRole="header">
            Unfinished from earlier
          </AppText>
          <AppText variant="body-sm" tone="muted" style={styles.sub}>
            From the last two weeks. Bring one into today, or let it go.
          </AppText>
          {data.carryOver.map((priority, index) => (
            <View
              key={priority.id}
              style={[
                styles.carry,
                index > 0 && {
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: colors.border,
                },
              ]}
            >
              <AppText>{priority.title}</AppText>
              <AppText variant="caption" tone="muted">
                {formatISODate(priority.day, APP_LOCALE, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
                {priority.area ? ` · ${lifeAreaLabels[priority.area]}` : ""}
              </AppText>
              <View style={styles.actions}>
                <Button
                  label="Move to today"
                  variant="secondary"
                  size="sm"
                  icon={ArrowUp}
                  disabled={slotsLeft === 0}
                  onPress={() => void growth.moveToToday(priority.id).then(report)}
                />
                <Button
                  label="Remove"
                  variant="ghost"
                  size="sm"
                  onPress={() => void growth.removePriority(priority.id).then(report)}
                />
              </View>
            </View>
          ))}
          {slotsLeft === 0 ? (
            <AppText variant="body-sm" tone="muted" style={styles.full}>
              Today is full. Finish or remove a priority to bring one forward.
            </AppText>
          ) : null}
        </Card>
      ) : null}

      <Card>
        <AppText variant="heading-3" accessibilityRole="header">
          Today&apos;s habits
        </AppText>
        {growth.habits.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="No habits yet"
            description="Start with one habit small enough to do on your worst day."
            action={<ButtonLink href="/habits" label="Create a habit" size="sm" />}
          />
        ) : dueHabits.length === 0 ? (
          <EmptyState
            icon={Moon}
            title="Nothing scheduled today"
            description="None of your habits are due today. Rest days are part of the plan."
          />
        ) : (
          dueHabits.map((habit, index) => (
            <View
              key={habit.id}
              style={[
                styles.habit,
                index > 0 && {
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: colors.border,
                },
              ]}
            >
              <CheckToggle
                size="lg"
                checked={habit.completedToday}
                label={habit.name}
                onToggle={() =>
                  void growth.setCheckin(habit.id, growth.today, !habit.completedToday).then(report)
                }
              />
              <View style={styles.flex}>
                <AppText variant="label" numberOfLines={1}>
                  {habit.name}
                </AppText>
                <AppText variant="caption" tone="muted">
                  {describeSchedule(habit.schedule)} · {describeStreak(habit)}
                </AppText>
              </View>
            </View>
          ))
        )}
      </Card>
    </>
  );
}

export default function TodayScreen() {
  const { today, refresh, refreshing } = useGrowth();
  return (
    <Screen kind="tab" onRefresh={() => void refresh()} refreshing={refreshing}>
      <PageHeader
        eyebrow={formatISODate(today, APP_LOCALE, {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
        title="Today"
        description="Pick up to three priorities, then keep your habits moving."
      />
      <GrowthGate icon={ListChecks}>{(data) => <Planner data={data} />}</GrowthGate>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  progress: { flexDirection: "row", alignItems: "center", gap: 12 },
  sub: { marginTop: 2, marginBottom: 12 },
  list: { gap: 8, marginBottom: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 56,
    borderRadius: 12,
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 8,
  },
  struck: { textDecorationLine: "line-through" },
  form: { gap: 14, marginTop: 4 },
  full: { marginTop: 4 },
  carry: { paddingVertical: 12, gap: 2 },
  actions: { flexDirection: "row", gap: 4, marginTop: 8, marginLeft: -8 },
  habit: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
});

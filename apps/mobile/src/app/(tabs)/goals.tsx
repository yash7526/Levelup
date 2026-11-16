import type { Goal, GoalStatus, PlanningData } from "@levelup/types";
import {
  APP_LOCALE,
  formatISODate,
  goalProgress,
  goalStatusLabels,
  lifeAreaLabels,
  MAX_MILESTONES_PER_GOAL,
  MILESTONE_TITLE_MAX_LENGTH,
  parseMilestoneTitle,
  pluralize,
  targetState,
  toPercent,
} from "@levelup/utils";
import {
  CirclePause,
  CirclePlay,
  Pencil,
  Plus,
  RotateCcw,
  Target,
  Trash2,
  Trophy,
} from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { GoalFormSheet } from "@/components/goals/goal-form-sheet";
import { ActionError } from "@/components/growth/action-error";
import { CheckToggle } from "@/components/growth/check-toggle";
import { PlanningGate } from "@/components/growth/planning-gate";
import { PageHeader, Screen } from "@/components/layout/screen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { ProgressBar } from "@/components/ui/progress";
import { Sheet } from "@/components/ui/sheet";
import { AppText } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";
import { usePlanning } from "@/providers/planning";
import { useTheme } from "@/theme/use-theme";

type Editor = { goal: Goal | null; key: number } | null;

function targetLabel(goal: Goal, today: string): { text: string; overdue: boolean } | null {
  const state = targetState(goal.targetDate, today);
  if (state.kind === "none" || !goal.targetDate) return null;
  const date = formatISODate(goal.targetDate, APP_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (goal.status === "completed") return { text: date, overdue: false };
  if (state.kind === "upcoming") {
    return { text: `${date} · ${pluralize(state.days, "day")} left`, overdue: false };
  }
  if (state.kind === "today") return { text: `${date} · due today`, overdue: false };
  return { text: `${date} · ${pluralize(state.days, "day")} overdue`, overdue: true };
}

function AddMilestone({ goal, onError }: { goal: Goal; onError: (m: string) => void }) {
  const { addMilestone } = usePlanning();
  const [title, setTitle] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  if (goal.milestones.length >= MAX_MILESTONES_PER_GOAL) {
    return (
      <AppText variant="caption" tone="muted">
        Up to {MAX_MILESTONES_PER_GOAL} milestones per goal.
      </AppText>
    );
  }

  async function submit() {
    const parsed = parseMilestoneTitle(title);
    if (!parsed.ok) {
      setFieldError(parsed.error);
      return;
    }
    setFieldError(undefined);
    setSaving(true);
    const error = await addMilestone(goal.id, parsed.value);
    setSaving(false);
    if (error) onError(error);
    else setTitle("");
  }

  return (
    <View style={styles.addRow}>
      <View style={styles.flex}>
        <TextField
          label="Add a milestone"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            setFieldError(undefined);
          }}
          placeholder="e.g. Run 5k without stopping"
          maxLength={MILESTONE_TITLE_MAX_LENGTH}
          returnKeyType="done"
          onSubmitEditing={() => void submit()}
          error={fieldError}
        />
      </View>
      <Button
        label="Add"
        variant="secondary"
        icon={Plus}
        loading={saving}
        onPress={() => void submit()}
        style={styles.addButton}
      />
    </View>
  );
}

function Board({ data }: { data: PlanningData }) {
  const { colors } = useTheme();
  const planning = usePlanning();
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<Editor>(null);
  const [toDelete, setToDelete] = useState<Goal | null>(null);
  const [deleting, setDeleting] = useState(false);
  const report = (message: string | null) => setError(message);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    const message = await planning.deleteGoal(toDelete.id);
    setDeleting(false);
    if (message) setError(message);
    setToDelete(null);
  }

  const sections: GoalStatus[] = ["active", "paused", "completed"];

  return (
    <>
      <ActionError message={error} onDismiss={() => setError(null)} />

      {data.goals.length === 0 ? (
        <Card>
          <EmptyState
            icon={Target}
            title="No goals yet"
            description="Set a meaningful goal and break it into milestones. Progress is measured by milestones reached, never guessed."
            action={
              <Button
                label="Set your first goal"
                icon={Plus}
                onPress={() => setEditor({ goal: null, key: Date.now() })}
              />
            }
          />
        </Card>
      ) : (
        <>
          <Button
            label="New goal"
            icon={Plus}
            onPress={() => setEditor({ goal: null, key: Date.now() })}
          />
          {sections.map((status) => {
            const list = data.goals.filter((goal) => goal.status === status);
            if (list.length === 0) return null;
            return (
              <View key={status} style={styles.section}>
                <AppText variant="overline" tone="muted" accessibilityRole="header">
                  {goalStatusLabels[status]} ({list.length})
                </AppText>
                {list.map((goal) => {
                  const progress = goalProgress(goal);
                  const target = targetLabel(goal, data.today);
                  return (
                    <Card key={goal.id} style={styles.card}>
                      <View style={styles.head}>
                        <View style={styles.flex}>
                          <AppText variant="heading-3">{goal.title}</AppText>
                          <View style={styles.meta}>
                            {goal.area ? <Badge label={lifeAreaLabels[goal.area]} /> : null}
                            {target ? (
                              <AppText variant="caption" tone={target.overdue ? "danger" : "muted"}>
                                {target.text}
                              </AppText>
                            ) : null}
                          </View>
                        </View>
                        {status === "completed" ? (
                          <Trophy size={20} color={colors.warning} />
                        ) : null}
                      </View>

                      {progress.total > 0 ? (
                        <View style={styles.progress}>
                          <View style={styles.progressText}>
                            <AppText variant="caption" tone="muted">
                              {progress.completed} of {pluralize(progress.total, "milestone")}
                            </AppText>
                            <AppText variant="label">{toPercent(progress)}%</AppText>
                          </View>
                          <ProgressBar
                            value={progress.completed}
                            max={progress.total}
                            label={`${goal.title} progress`}
                            valueText={`${progress.completed} of ${progress.total} milestones`}
                          />
                        </View>
                      ) : (
                        <AppText variant="body-sm" tone="muted">
                          Add milestones to start measuring progress.
                        </AppText>
                      )}

                      {goal.milestones.map((milestone) => {
                        const done = milestone.completedAt !== null;
                        return (
                          <View key={milestone.id} style={styles.milestone}>
                            <CheckToggle
                              checked={done}
                              label={milestone.title}
                              onToggle={() =>
                                void planning.setMilestoneDone(milestone.id, !done).then(report)
                              }
                            />
                            <AppText
                              tone={done ? "muted" : "default"}
                              style={[styles.flex, done && styles.struck]}
                            >
                              {milestone.title}
                            </AppText>
                            <IconButton
                              icon={Trash2}
                              label={`Remove milestone ${milestone.title}`}
                              onPress={() =>
                                void planning.deleteMilestone(milestone.id).then(report)
                              }
                            />
                          </View>
                        );
                      })}

                      {status !== "completed" ? (
                        <AddMilestone goal={goal} onError={setError} />
                      ) : null}

                      <View style={styles.actions}>
                        <Button
                          label="Edit"
                          variant="outline"
                          size="sm"
                          icon={Pencil}
                          onPress={() => setEditor({ goal, key: Date.now() })}
                        />
                        {status === "active" ? (
                          <>
                            <Button
                              label="Pause"
                              variant="outline"
                              size="sm"
                              icon={CirclePause}
                              onPress={() =>
                                void planning.setGoalStatus(goal.id, "paused").then(report)
                              }
                            />
                            <Button
                              label="Mark complete"
                              variant="accent"
                              size="sm"
                              icon={Trophy}
                              onPress={() =>
                                void planning.setGoalStatus(goal.id, "completed").then(report)
                              }
                            />
                          </>
                        ) : (
                          <Button
                            label={status === "paused" ? "Resume" : "Reopen"}
                            variant="outline"
                            size="sm"
                            icon={status === "paused" ? CirclePlay : RotateCcw}
                            onPress={() =>
                              void planning.setGoalStatus(goal.id, "active").then(report)
                            }
                          />
                        )}
                        <Button
                          label="Delete"
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onPress={() => setToDelete(goal)}
                        />
                      </View>
                    </Card>
                  );
                })}
              </View>
            );
          })}
        </>
      )}

      {editor ? (
        <GoalFormSheet key={editor.key} goal={editor.goal} onClose={() => setEditor(null)} />
      ) : null}

      <Sheet
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        title={toDelete ? `Delete ${toDelete.title}?` : "Delete goal?"}
        description="This permanently removes the goal and all of its milestones. This can't be undone."
      >
        <View style={styles.confirm}>
          <Button label="Cancel" variant="outline" onPress={() => setToDelete(null)} />
          <Button
            label="Delete goal"
            variant="danger"
            loading={deleting}
            onPress={() => void confirmDelete()}
          />
        </View>
      </Sheet>
    </>
  );
}

export default function GoalsScreen() {
  const { refresh, refreshing } = usePlanning();
  return (
    <Screen kind="tab" onRefresh={() => void refresh()} refreshing={refreshing}>
      <PageHeader
        title="Goals"
        description="Turn long-term ambitions into milestones you can actually see yourself reach."
      />
      <PlanningGate icon={Target}>{(data) => <Board data={data} />}</PlanningGate>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  section: { gap: 12 },
  card: { gap: 14 },
  head: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  meta: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 6 },
  progress: { gap: 8 },
  progressText: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  milestone: { flexDirection: "row", alignItems: "center", gap: 10 },
  struck: { textDecorationLine: "line-through" },
  addRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  addButton: { marginBottom: 0 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  confirm: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
});

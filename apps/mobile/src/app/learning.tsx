import type { LearningItem, PlanningData } from "@levelup/types";
import {
  APP_LOCALE,
  formatISODate,
  learningProgress,
  learningUnitLabels,
  pluralize,
  sessionMinutesThisWeek,
  studyStreak,
  toPercent,
} from "@levelup/utils";
import {
  Archive,
  ArchiveRestore,
  BookOpen,
  Flame,
  Minus,
  Pencil,
  Plus,
  Timer,
  Trash2,
} from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { ActionError } from "@/components/growth/action-error";
import { PlanningGate } from "@/components/growth/planning-gate";
import { Screen } from "@/components/layout/screen";
import { LearningItemSheet, LogSessionSheet } from "@/components/learning/learning-sheets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { ProgressBar } from "@/components/ui/progress";
import { AppText } from "@/components/ui/text";
import { usePlanning } from "@/providers/planning";
import { useTheme } from "@/theme/use-theme";

const kindLabels = { course: "Course", book: "Book", skill: "Skill", article: "Article" } as const;

function minutesText(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

type Editor = { item: LearningItem | null; key: number } | null;

function Library({ data }: { data: PlanningData }) {
  const { colors } = useTheme();
  const planning = usePlanning();
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<Editor>(null);
  const [logging, setLogging] = useState<LearningItem | null>(null);
  const report = (message: string | null) => setError(message);

  const active = data.learning.filter((item) => item.archivedAt === null);
  const archived = data.learning.filter((item) => item.archivedAt !== null);
  const titles = new Map(data.learning.map((item) => [item.id, item.title]));
  const recent = data.sessions.slice(0, 8);
  const streak = studyStreak(data.sessions, data.today);

  function step(item: LearningItem, delta: number) {
    const completed = Math.min(Math.max(item.completed + delta, 0), item.total);
    if (completed !== item.completed) {
      void planning.setLearningProgress(item.id, completed).then(report);
    }
  }

  return (
    <>
      <ActionError message={error} onDismiss={() => setError(null)} />

      {data.learning.length === 0 ? (
        <Card>
          <EmptyState
            icon={BookOpen}
            title="Your library is empty"
            description="Add a course, book, skill or article, track it by lessons, chapters, pages or modules, and log short sessions as you go."
            action={
              <Button
                label="Add your first item"
                icon={Plus}
                onPress={() => setEditor({ item: null, key: Date.now() })}
              />
            }
          />
        </Card>
      ) : (
        <>
          <Button
            label="Add item"
            icon={Plus}
            onPress={() => setEditor({ item: null, key: Date.now() })}
          />

          {data.sessions.length > 0 ? (
            <Card style={styles.summary}>
              <View style={styles.flex}>
                <AppText variant="caption" tone="muted">
                  This week
                </AppText>
                <AppText variant="heading-3">
                  {minutesText(sessionMinutesThisWeek(data.sessions, data.today))}
                </AppText>
              </View>
              <View style={styles.flex}>
                <AppText variant="caption" tone="muted">
                  Study streak
                </AppText>
                <View style={styles.streak}>
                  <Flame size={18} color={streak > 0 ? colors.warning : colors.foregroundSubtle} />
                  <AppText variant="heading-3">{pluralize(streak, "day")}</AppText>
                </View>
              </View>
            </Card>
          ) : null}

          {active.length === 0 ? (
            <Card>
              <EmptyState
                icon={BookOpen}
                title="Nothing in progress"
                description="Everything is archived. Restore an item below or add something new."
              />
            </Card>
          ) : (
            active.map((item) => {
              const progress = learningProgress(item);
              const unit = learningUnitLabels[item.unit];
              const finished = progress.completed >= progress.total;
              return (
                <Card key={item.id} style={styles.card}>
                  <View>
                    <AppText variant="heading-3">{item.title}</AppText>
                    <View style={styles.meta}>
                      <Badge label={kindLabels[item.kind]} />
                      {finished ? <Badge label="Finished" variant="success" /> : null}
                    </View>
                  </View>

                  <View style={styles.progress}>
                    <View style={styles.progressText}>
                      <AppText variant="caption" tone="muted">
                        {progress.completed} of {progress.total} {unit.plural}
                      </AppText>
                      <AppText variant="label">{toPercent(progress)}%</AppText>
                    </View>
                    <ProgressBar
                      value={progress.completed}
                      max={progress.total}
                      label={`${item.title} progress`}
                      valueText={`${progress.completed} of ${progress.total} ${unit.plural}`}
                    />
                  </View>

                  <View style={styles.row}>
                    <IconButton
                      icon={Minus}
                      label={`One ${unit.singular} less`}
                      tone="default"
                      disabled={progress.completed <= 0}
                      onPress={() => step(item, -1)}
                    />
                    <Button
                      label={`Finished a ${unit.singular}`}
                      variant="secondary"
                      size="sm"
                      icon={Plus}
                      disabled={finished}
                      onPress={() => step(item, 1)}
                    />
                  </View>

                  <View style={styles.row}>
                    <Button
                      label="Log session"
                      size="sm"
                      icon={Timer}
                      onPress={() => setLogging(item)}
                    />
                    <Button
                      label="Edit"
                      variant="outline"
                      size="sm"
                      icon={Pencil}
                      onPress={() => setEditor({ item, key: Date.now() })}
                    />
                    <Button
                      label="Archive"
                      variant="ghost"
                      size="sm"
                      icon={Archive}
                      onPress={() => void planning.setLearningArchived(item.id, true).then(report)}
                    />
                  </View>
                </Card>
              );
            })
          )}

          {recent.length > 0 ? (
            <Card>
              <AppText variant="heading-3" accessibilityRole="header">
                Recent sessions
              </AppText>
              {recent.map((session) => (
                <View key={session.id} style={styles.session}>
                  <View style={styles.flex}>
                    <AppText variant="label">
                      {titles.get(session.itemId) ?? "Archived item"}
                    </AppText>
                    <AppText variant="caption" tone="muted">
                      {formatISODate(session.day, APP_LOCALE, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      · {minutesText(session.minutes)}
                    </AppText>
                    {session.note ? <AppText variant="body-sm">{session.note}</AppText> : null}
                  </View>
                  <IconButton
                    icon={Trash2}
                    label="Remove this session"
                    onPress={() => void planning.deleteSession(session.id).then(report)}
                  />
                </View>
              ))}
            </Card>
          ) : null}
        </>
      )}

      {archived.length > 0 ? (
        <Card variant="outline">
          <AppText variant="label">Archived items ({archived.length})</AppText>
          {archived.map((item) => (
            <View key={item.id} style={styles.session}>
              <View style={styles.flex}>
                <AppText numberOfLines={1}>{item.title}</AppText>
                <AppText variant="caption" tone="muted">
                  {item.completed} of {item.total} {learningUnitLabels[item.unit].plural}
                </AppText>
              </View>
              <Button
                label="Restore"
                variant="outline"
                size="sm"
                icon={ArchiveRestore}
                onPress={() => void planning.setLearningArchived(item.id, false).then(report)}
              />
            </View>
          ))}
        </Card>
      ) : null}

      {editor ? (
        <LearningItemSheet key={editor.key} item={editor.item} onClose={() => setEditor(null)} />
      ) : null}
      {logging ? (
        <LogSessionSheet key={logging.id} item={logging} onClose={() => setLogging(null)} />
      ) : null}
    </>
  );
}

export default function LearningScreen() {
  const { refresh, refreshing } = usePlanning();
  return (
    <Screen kind="stack" onRefresh={() => void refresh()} refreshing={refreshing}>
      <AppText variant="body-lg" tone="muted">
        Keep the courses, books and skills you&apos;re working through moving forward.
      </AppText>
      <PlanningGate icon={BookOpen}>{(data) => <Library data={data} />}</PlanningGate>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  summary: { flexDirection: "row", gap: 16 },
  streak: { flexDirection: "row", alignItems: "center", gap: 6 },
  card: { gap: 14 },
  meta: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  progress: { gap: 8 },
  progressText: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  session: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12 },
});

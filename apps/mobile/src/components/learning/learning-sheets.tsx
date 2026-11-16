import type { LearningItem, LearningKind, LearningUnit } from "@levelup/types";
import {
  LEARNING_TITLE_MAX_LENGTH,
  LEARNING_TOTAL_MAX,
  parseLearningTitle,
  parseSessionNote,
  parseWholeNumber,
  SESSION_MINUTES_MAX,
  SESSION_NOTE_MAX_LENGTH,
} from "@levelup/utils";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Sheet } from "@/components/ui/sheet";
import { AppText } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";
import { usePlanning } from "@/providers/planning";

const kinds: { value: LearningKind; label: string }[] = [
  { value: "course", label: "Course" },
  { value: "book", label: "Book" },
  { value: "skill", label: "Skill" },
  { value: "article", label: "Article" },
];
const units: { value: LearningUnit; label: string }[] = [
  { value: "lessons", label: "Lessons" },
  { value: "chapters", label: "Chapters" },
  { value: "pages", label: "Pages" },
  { value: "modules", label: "Modules" },
];

/** Add or edit a learning item. Mount it to open it; it closes itself after saving. */
export function LearningItemSheet({
  item,
  onClose,
}: {
  item: LearningItem | null;
  onClose: () => void;
}) {
  const { saveLearningItem } = usePlanning();
  const [title, setTitle] = useState(item?.title ?? "");
  const [kind, setKind] = useState<LearningKind>(item?.kind ?? "course");
  const [unit, setUnit] = useState<LearningUnit>(item?.unit ?? "lessons");
  const [total, setTotal] = useState(item ? String(item.total) : "");
  const [errors, setErrors] = useState<{ title?: string; total?: string }>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    const parsedTitle = parseLearningTitle(title);
    const parsedTotal = parseWholeNumber(total, 1, LEARNING_TOTAL_MAX, "The total");
    if (!parsedTitle.ok || !parsedTotal.ok) {
      setErrors({
        title: parsedTitle.ok ? undefined : parsedTitle.error,
        total: parsedTotal.ok ? undefined : parsedTotal.error,
      });
      return;
    }
    setErrors({});
    setFailure(null);
    setSaving(true);
    const error = await saveLearningItem(
      item?.id ?? null,
      { title: parsedTitle.value, kind, unit, total: parsedTotal.value },
      item?.completed ?? 0,
    );
    setSaving(false);
    if (error) setFailure(error);
    else onClose();
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title={item ? "Edit item" : "Add to your library"}
      description={
        item
          ? "Lowering the total below your progress brings your progress down with it."
          : "A course, book, skill or article you're working through."
      }
    >
      <View style={styles.form}>
        <TextField
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Foundations of Product Design"
          maxLength={LEARNING_TITLE_MAX_LENGTH}
          error={errors.title}
        />
        <View style={styles.group}>
          <AppText variant="label">Type</AppText>
          <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel="Type">
            {kinds.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={kind === option.value}
                onPress={() => setKind(option.value)}
              />
            ))}
          </View>
        </View>
        <View style={styles.group}>
          <AppText variant="label">Measured in</AppText>
          <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel="Measured in">
            {units.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={unit === option.value}
                onPress={() => setUnit(option.value)}
              />
            ))}
          </View>
        </View>
        <TextField
          label="Total"
          value={total}
          onChangeText={setTotal}
          keyboardType="number-pad"
          placeholder="e.g. 12"
          hint="How many in all, e.g. 12 lessons or 320 pages."
          maxLength={6}
          error={errors.total}
        />
        {failure ? (
          <AppText variant="body-sm" tone="danger" accessibilityLiveRegion="polite">
            {failure}
          </AppText>
        ) : null}
        <View style={styles.actions}>
          <Button label="Cancel" variant="outline" onPress={onClose} />
          <Button
            label={item ? "Save changes" : "Add item"}
            loading={saving}
            onPress={() => void submit()}
          />
        </View>
      </View>
    </Sheet>
  );
}

const quickMinutes = [15, 25, 45, 60];

/** Log a study session for today. Mount it to open it; it closes itself after saving. */
export function LogSessionSheet({ item, onClose }: { item: LearningItem; onClose: () => void }) {
  const { logSession } = usePlanning();
  const [minutes, setMinutes] = useState("25");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ minutes?: string; note?: string }>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    const parsedMinutes = parseWholeNumber(minutes, 1, SESSION_MINUTES_MAX, "Minutes");
    const parsedNote = parseSessionNote(note);
    if (!parsedMinutes.ok || !parsedNote.ok) {
      setErrors({
        minutes: parsedMinutes.ok ? undefined : parsedMinutes.error,
        note: parsedNote.ok ? undefined : parsedNote.error,
      });
      return;
    }
    setErrors({});
    setFailure(null);
    setSaving(true);
    const error = await logSession(item.id, parsedMinutes.value, parsedNote.value);
    setSaving(false);
    if (error) setFailure(error);
    else onClose();
  }

  return (
    <Sheet open onClose={onClose} title="Log a session" description={item.title}>
      <View style={styles.form}>
        <TextField
          label="Minutes"
          value={minutes}
          onChangeText={setMinutes}
          keyboardType="number-pad"
          maxLength={4}
          error={errors.minutes}
        />
        <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel="Quick minutes">
          {quickMinutes.map((value) => (
            <Chip
              key={value}
              label={`${value} min`}
              selected={minutes === String(value)}
              onPress={() => setMinutes(String(value))}
            />
          ))}
        </View>
        <TextField
          label="Key takeaway (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="What stuck with you?"
          multiline
          maxLength={SESSION_NOTE_MAX_LENGTH}
          error={errors.note}
        />
        {failure ? (
          <AppText variant="body-sm" tone="danger" accessibilityLiveRegion="polite">
            {failure}
          </AppText>
        ) : null}
        <View style={styles.actions}>
          <Button label="Cancel" variant="outline" onPress={onClose} />
          <Button label="Log session" loading={saving} onPress={() => void submit()} />
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  form: { gap: 18 },
  group: { gap: 10 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  actions: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
});

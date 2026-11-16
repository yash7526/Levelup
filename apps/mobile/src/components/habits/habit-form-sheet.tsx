import type { Habit, HabitSchedule, LifeArea, Weekday } from "@levelup/types";
import {
  APP_LOCALE,
  getWeekdayLabels,
  HABIT_NAME_MAX_LENGTH,
  HABIT_WEEKLY_TARGET_MAX,
  parseHabitDraft,
  type HabitDraftErrors,
  WEEKDAYS,
} from "@levelup/utils";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { AreaPicker } from "@/components/growth/area-picker";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Sheet } from "@/components/ui/sheet";
import { AppText } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";
import { useGrowth } from "@/providers/growth";

const shortDays = getWeekdayLabels(APP_LOCALE, "short");
const longDays = getWeekdayLabels(APP_LOCALE, "long");

const scheduleOptions: { type: HabitSchedule["type"]; label: string }[] = [
  { type: "daily", label: "Every day" },
  { type: "weekdays", label: "Specific days" },
  { type: "weekly", label: "Times a week" },
];

interface HabitFormSheetProps {
  /** The habit being edited, or `null` to create one. */
  habit: Habit | null;
  onClose: () => void;
}

/** Create or edit a habit. Mount it to open it; it closes itself after saving. */
export function HabitFormSheet({ habit, onClose }: HabitFormSheetProps) {
  const { saveHabit } = useGrowth();
  const schedule = habit?.schedule;
  const [name, setName] = useState(habit?.name ?? "");
  const [area, setArea] = useState<LifeArea | null>(habit?.area ?? null);
  const [type, setType] = useState<HabitSchedule["type"]>(schedule?.type ?? "daily");
  const [days, setDays] = useState<readonly Weekday[]>(
    schedule?.type === "weekdays" ? schedule.days : [1, 2, 3, 4, 5],
  );
  const [times, setTimes] = useState(schedule?.type === "weekly" ? schedule.timesPerWeek : 3);
  const [errors, setErrors] = useState<HabitDraftErrors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const toggleDay = (day: Weekday) =>
    setDays((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day],
    );

  async function submit() {
    const draft = parseHabitDraft({ name, area, schedule: { type, days, timesPerWeek: times } });
    if (!draft.ok) {
      setErrors(draft.error);
      return;
    }
    setErrors({});
    setFailure(null);
    setSaving(true);
    const error = await saveHabit(habit?.id ?? null, draft.value);
    setSaving(false);
    if (error) setFailure(error);
    else onClose();
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title={habit ? "Edit habit" : "New habit"}
      description={
        habit
          ? "Changes apply from now on. Past check-ins stay as they are."
          : "Pick something small enough to do on your worst day."
      }
    >
      <View style={styles.form}>
        <TextField
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Read 20 pages"
          maxLength={HABIT_NAME_MAX_LENGTH}
          error={errors.name}
        />
        <AreaPicker value={area} onChange={setArea} />

        <View style={styles.group}>
          <AppText variant="label">How often?</AppText>
          <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel="How often">
            {scheduleOptions.map((option) => (
              <Chip
                key={option.type}
                label={option.label}
                selected={type === option.type}
                onPress={() => setType(option.type)}
              />
            ))}
          </View>

          {type === "weekdays" ? (
            <View style={styles.days}>
              {WEEKDAYS.map((day) => (
                <Chip
                  key={day}
                  grow
                  role="checkbox"
                  label={(shortDays[day - 1] ?? "").slice(0, 2)}
                  accessibilityLabel={longDays[day - 1]}
                  selected={days.includes(day)}
                  onPress={() => toggleDay(day)}
                />
              ))}
            </View>
          ) : null}

          {type === "weekly" ? (
            <View
              style={styles.wrap}
              accessibilityRole="radiogroup"
              accessibilityLabel="Times per week"
            >
              {Array.from({ length: HABIT_WEEKLY_TARGET_MAX }, (_, i) => i + 1).map((n) => (
                <Chip
                  key={n}
                  label={`${n}×`}
                  accessibilityLabel={n === 1 ? "Once a week" : `${n} times a week`}
                  selected={times === n}
                  onPress={() => setTimes(n)}
                />
              ))}
            </View>
          ) : null}

          {errors.schedule ? (
            <AppText variant="body-sm" tone="danger">
              {errors.schedule}
            </AppText>
          ) : null}
        </View>

        {failure ? (
          <AppText variant="body-sm" tone="danger" accessibilityLiveRegion="polite">
            {failure}
          </AppText>
        ) : null}

        <View style={styles.actions}>
          <Button label="Cancel" variant="outline" onPress={onClose} />
          <Button
            label={habit ? "Save changes" : "Create habit"}
            loading={saving}
            onPress={() => void submit()}
          />
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  form: { gap: 18 },
  group: { gap: 10 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  days: { flexDirection: "row", gap: 6 },
  actions: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
});

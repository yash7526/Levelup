import type { Goal, LifeArea } from "@levelup/types";
import {
  GOAL_TITLE_MAX_LENGTH,
  parseGoalTitle,
  parseLifeArea,
  parseTargetDate,
} from "@levelup/utils";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { AreaPicker } from "@/components/growth/area-picker";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { AppText } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";
import { usePlanning } from "@/providers/planning";

interface GoalFormSheetProps {
  /** The goal being edited, or `null` to create one. */
  goal: Goal | null;
  onClose: () => void;
}

/** Create or edit a goal. Mount it to open it; it closes itself after saving. */
export function GoalFormSheet({ goal, onClose }: GoalFormSheetProps) {
  const { saveGoal } = usePlanning();
  const [title, setTitle] = useState(goal?.title ?? "");
  const [area, setArea] = useState<LifeArea | null>(goal?.area ?? null);
  const [date, setDate] = useState(goal?.targetDate ?? "");
  const [errors, setErrors] = useState<{ title?: string; targetDate?: string }>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    const parsedTitle = parseGoalTitle(title);
    const parsedArea = parseLifeArea(area);
    const parsedDate = parseTargetDate(date.trim());
    if (!parsedTitle.ok || !parsedArea.ok || !parsedDate.ok) {
      setErrors({
        title: parsedTitle.ok ? undefined : parsedTitle.error,
        targetDate: parsedDate.ok ? undefined : parsedDate.error,
      });
      return;
    }
    setErrors({});
    setFailure(null);
    setSaving(true);
    const error = await saveGoal(goal?.id ?? null, {
      title: parsedTitle.value,
      area: parsedArea.value,
      targetDate: parsedDate.value,
    });
    setSaving(false);
    if (error) setFailure(error);
    else onClose();
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title={goal ? "Edit goal" : "New goal"}
      description={
        goal
          ? "Milestones are managed on the goal itself."
          : "Name the outcome, then break it into milestones."
      }
    >
      <View style={styles.form}>
        <TextField
          label="Goal"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Run a half marathon"
          maxLength={GOAL_TITLE_MAX_LENGTH}
          error={errors.title}
        />
        <AreaPicker value={area} onChange={setArea} />
        <TextField
          label="Target date (optional)"
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          hint="For example 2027-04-18. Leave blank for no date."
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={10}
          error={errors.targetDate}
        />
        {failure ? (
          <AppText variant="body-sm" tone="danger" accessibilityLiveRegion="polite">
            {failure}
          </AppText>
        ) : null}
        <View style={styles.actions}>
          <Button label="Cancel" variant="outline" onPress={onClose} />
          <Button
            label={goal ? "Save changes" : "Create goal"}
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
  actions: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
});

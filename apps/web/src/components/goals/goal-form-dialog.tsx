"use client";

import type { Goal } from "@levelup/types";
import { GOAL_TITLE_MAX_LENGTH } from "@levelup/utils";
import { type FormEvent, useId, useState, useTransition } from "react";

import { type SaveGoalResult, saveGoal } from "@/app/(app)/goals/actions";
import { Button } from "@/components/ui/button";
import { Label, TextField } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { lifeAreaLabels } from "@/lib/locale";

const areaOptions = Object.entries(lifeAreaLabels);

interface GoalFormDialogProps {
  /** The goal being edited, or `null` to create one. */
  goal: Goal | null;
  onClose: () => void;
}

/** Create or edit a goal. Mount it to open it; it closes itself after saving. */
export function GoalFormDialog({ goal, onClose }: GoalFormDialogProps) {
  const formId = useId();
  const [result, setResult] = useState<SaveGoalResult | null>(null);
  const [pending, startTransition] = useTransition();
  const failure = result && !result.ok ? result : null;
  const errors = failure?.fieldErrors ?? {};

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const saved = await saveGoal(formData);
      if (saved.ok) onClose();
      else setResult(saved);
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      variant="sheet"
      title={goal ? "Edit goal" : "New goal"}
      description={
        goal
          ? "Milestones are managed on the goal itself."
          : "Name the outcome, then break it into milestones."
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={pending}>
            {goal ? "Save changes" : "Create goal"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="grid gap-5">
        {goal ? <input type="hidden" name="id" value={goal.id} /> : null}
        <TextField
          id={`${formId}-title`}
          name="title"
          label="Goal"
          placeholder="e.g. Run a half marathon"
          defaultValue={goal?.title}
          maxLength={GOAL_TITLE_MAX_LENGTH}
          autoComplete="off"
          error={errors.title}
        />
        <div className="grid gap-1.5">
          <Label htmlFor={`${formId}-area`}>Area (optional)</Label>
          <Select
            id={`${formId}-area`}
            name="area"
            defaultValue={goal?.area ?? ""}
            invalid={Boolean(errors.area)}
          >
            <option value="">No area</option>
            {areaOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <TextField
          id={`${formId}-date`}
          name="targetDate"
          type="date"
          label="Target date (optional)"
          defaultValue={goal?.targetDate ?? ""}
          error={errors.targetDate}
        />
        <p role="alert" className="text-body-sm text-danger empty:hidden">
          {failure?.error ?? null}
        </p>
      </form>
    </Modal>
  );
}

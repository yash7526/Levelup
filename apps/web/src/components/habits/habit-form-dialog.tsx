"use client";

import type { Habit, HabitSchedule } from "@levelup/types";
import {
  APP_LOCALE,
  getWeekdayLabels,
  HABIT_NAME_MAX_LENGTH,
  HABIT_WEEKLY_TARGET_MAX,
  WEEKDAYS,
} from "@levelup/utils";
import { CircleAlert } from "lucide-react";
import { type FormEvent, useId, useState, useTransition } from "react";

import { saveHabit, type SaveHabitResult } from "@/app/(app)/habits/actions";
import { Button } from "@/components/ui/button";
import { Label, TextField } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import { lifeAreaLabels } from "@/lib/locale";

const areaOptions = Object.entries(lifeAreaLabels);
const shortDays = getWeekdayLabels(APP_LOCALE, "short");
const longDays = getWeekdayLabels(APP_LOCALE, "long");

const scheduleOptions: { type: HabitSchedule["type"]; label: string; hint: string }[] = [
  { type: "daily", label: "Every day", hint: "Seven days a week" },
  { type: "weekdays", label: "Specific days", hint: "e.g. Mon, Wed, Fri" },
  { type: "weekly", label: "Times a week", hint: "Any days you like" },
];

const choiceStyles = cn(
  "border border-border-strong bg-surface text-foreground transition-colors duration-150",
  "peer-checked:border-primary peer-checked:bg-primary/8 peer-checked:ring-1 peer-checked:ring-primary",
  "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface",
  "hover:border-foreground-subtle",
);

interface HabitFormDialogProps {
  /** The habit being edited, or `null` to create one. */
  habit: Habit | null;
  onClose: () => void;
}

/** Create or edit a habit. Mount it to open it; it closes itself after saving. */
export function HabitFormDialog({ habit, onClose }: HabitFormDialogProps) {
  const formId = useId();
  const schedule = habit?.schedule;
  const [scheduleType, setScheduleType] = useState<HabitSchedule["type"]>(
    schedule?.type ?? "daily",
  );
  const [result, setResult] = useState<SaveHabitResult | null>(null);
  const [pending, startTransition] = useTransition();
  const failure = result && !result.ok ? result : null;
  const errors = failure?.fieldErrors ?? {};

  const initialDays: readonly number[] =
    schedule?.type === "weekdays" ? schedule.days : [1, 2, 3, 4, 5];
  const initialTimes = schedule?.type === "weekly" ? schedule.timesPerWeek : 3;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const saved = await saveHabit(formData);
      if (saved.ok) onClose();
      else setResult(saved);
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      variant="sheet"
      title={habit ? "Edit habit" : "New habit"}
      description={
        habit
          ? "Changes apply from now on. Past check-ins stay as they are."
          : "Pick something small enough to do on your worst day."
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={pending}>
            {habit ? "Save changes" : "Create habit"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="grid gap-5">
        {habit ? <input type="hidden" name="id" value={habit.id} /> : null}

        <TextField
          id={`${formId}-name`}
          name="name"
          label="Name"
          placeholder="e.g. Read 20 pages"
          defaultValue={habit?.name}
          maxLength={HABIT_NAME_MAX_LENGTH}
          autoComplete="off"
          error={errors.name}
        />

        <div className="grid gap-1.5">
          <Label htmlFor={`${formId}-area`}>Area (optional)</Label>
          <Select
            id={`${formId}-area`}
            name="area"
            defaultValue={habit?.area ?? ""}
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

        <fieldset className="grid gap-3">
          <legend className="mb-1.5 text-label text-foreground">How often?</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {scheduleOptions.map((option) => (
              <label key={option.type} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="scheduleType"
                  value={option.type}
                  checked={scheduleType === option.type}
                  onChange={() => setScheduleType(option.type)}
                  className="peer sr-only"
                />
                <span className={cn("grid gap-0.5 rounded-xl px-3.5 py-3", choiceStyles)}>
                  <span className="text-label">{option.label}</span>
                  <span className="text-caption text-foreground-muted">{option.hint}</span>
                </span>
              </label>
            ))}
          </div>

          {/* Kept mounted while hidden so switching back keeps your choices. */}
          <fieldset hidden={scheduleType !== "weekdays"}>
            <legend className="sr-only">Days of the week</legend>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEKDAYS.map((day) => (
                <label key={day} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="days"
                    value={day}
                    defaultChecked={initialDays.includes(day)}
                    aria-label={longDays[day - 1]}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "grid h-11 place-items-center rounded-xl text-body-sm font-medium",
                      choiceStyles,
                    )}
                    aria-hidden="true"
                  >
                    {shortDays[day - 1]}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div hidden={scheduleType !== "weekly"} className="grid gap-1.5 sm:max-w-60">
            <Label htmlFor={`${formId}-times`}>Times per week</Label>
            <Select id={`${formId}-times`} name="timesPerWeek" defaultValue={String(initialTimes)}>
              {Array.from({ length: HABIT_WEEKLY_TARGET_MAX }, (_, index) => index + 1).map(
                (times) => (
                  <option key={times} value={times}>
                    {times === 1 ? "Once a week" : times === 2 ? "Twice a week" : `${times} times`}
                  </option>
                ),
              )}
            </Select>
          </div>

          {errors.schedule ? (
            <p className="flex items-center gap-1.5 text-body-sm text-danger">
              <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
              {errors.schedule}
            </p>
          ) : null}
        </fieldset>

        <p role="alert" className="text-body-sm text-danger empty:hidden">
          {failure?.error ?? null}
        </p>
      </form>
    </Modal>
  );
}

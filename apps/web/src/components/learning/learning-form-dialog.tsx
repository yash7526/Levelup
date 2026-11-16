"use client";

import type { LearningItem } from "@levelup/types";
import { LEARNING_TITLE_MAX_LENGTH, LEARNING_TOTAL_MAX } from "@levelup/utils";
import { type FormEvent, useId, useState, useTransition } from "react";

import { type SaveItemResult, saveLearningItem } from "@/app/(app)/learning/actions";
import { Button } from "@/components/ui/button";
import { Label, TextField } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";

const kindOptions = [
  { value: "course", label: "Course" },
  { value: "book", label: "Book" },
  { value: "skill", label: "Skill" },
  { value: "article", label: "Article" },
];
const unitOptions = [
  { value: "lessons", label: "Lessons" },
  { value: "chapters", label: "Chapters" },
  { value: "pages", label: "Pages" },
  { value: "modules", label: "Modules" },
];

interface LearningFormDialogProps {
  /** The item being edited, or `null` to add one. */
  item: LearningItem | null;
  onClose: () => void;
}

/** Add or edit a learning item. Mount it to open it; it closes itself after saving. */
export function LearningFormDialog({ item, onClose }: LearningFormDialogProps) {
  const formId = useId();
  const [result, setResult] = useState<SaveItemResult | null>(null);
  const [pending, startTransition] = useTransition();
  const failure = result && !result.ok ? result : null;
  const errors = failure?.fieldErrors ?? {};

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const saved = await saveLearningItem(formData);
      if (saved.ok) onClose();
      else setResult(saved);
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      variant="sheet"
      title={item ? "Edit item" : "Add to your library"}
      description={
        item
          ? "Lowering the total below your progress brings your progress down with it."
          : "A course, book, skill or article you're working through."
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={pending}>
            {item ? "Save changes" : "Add item"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="grid gap-5">
        {item ? (
          <>
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="completed" value={item.completed} />
          </>
        ) : null}
        <TextField
          id={`${formId}-title`}
          name="title"
          label="Title"
          placeholder="e.g. Foundations of Product Design"
          defaultValue={item?.title}
          maxLength={LEARNING_TITLE_MAX_LENGTH}
          autoComplete="off"
          error={errors.title}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor={`${formId}-kind`}>Type</Label>
            <Select
              id={`${formId}-kind`}
              name="kind"
              defaultValue={item?.kind ?? "course"}
              invalid={Boolean(errors.kind)}
            >
              {kindOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`${formId}-unit`}>Measured in</Label>
            <Select
              id={`${formId}-unit`}
              name="unit"
              defaultValue={item?.unit ?? "lessons"}
              invalid={Boolean(errors.unit)}
            >
              {unitOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <TextField
          id={`${formId}-total`}
          name="total"
          type="number"
          inputMode="numeric"
          min={1}
          max={LEARNING_TOTAL_MAX}
          label="Total"
          hint="How many in all, e.g. 12 lessons or 320 pages."
          defaultValue={item?.total}
          error={errors.total}
        />
        <p role="alert" className="text-body-sm text-danger empty:hidden">
          {failure?.error ?? null}
        </p>
      </form>
    </Modal>
  );
}

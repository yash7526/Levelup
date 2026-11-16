"use client";

import type { LearningItem } from "@levelup/types";
import { SESSION_MINUTES_MAX, SESSION_NOTE_MAX_LENGTH } from "@levelup/utils";
import { CircleAlert } from "lucide-react";
import { type FormEvent, useId, useState, useTransition } from "react";

import { type LogSessionResult, logSession } from "@/app/(app)/learning/actions";
import { Button } from "@/components/ui/button";
import { Label, TextField } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

interface LogSessionDialogProps {
  item: LearningItem;
  onClose: () => void;
}

const quickMinutes = [15, 25, 45, 60];

/** Log a study session for today. Mount it to open it; it closes itself after saving. */
export function LogSessionDialog({ item, onClose }: LogSessionDialogProps) {
  const formId = useId();
  const [minutes, setMinutes] = useState("25");
  const [result, setResult] = useState<LogSessionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const failure = result && !result.ok ? result : null;
  const errors = failure?.fieldErrors ?? {};

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const saved = await logSession(formData);
      if (saved.ok) onClose();
      else setResult(saved);
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      variant="sheet"
      title="Log a session"
      description={item.title}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={pending}>
            Log session
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="grid gap-5">
        <input type="hidden" name="itemId" value={item.id} />
        <div className="grid gap-2">
          <TextField
            id={`${formId}-minutes`}
            name="minutes"
            type="number"
            inputMode="numeric"
            min={1}
            max={SESSION_MINUTES_MAX}
            label="Minutes"
            value={minutes}
            onChange={(event) => setMinutes(event.target.value)}
            error={errors.minutes}
          />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Quick minutes">
            {quickMinutes.map((value) => (
              <Button
                key={value}
                size="sm"
                variant={minutes === String(value) ? "primary" : "outline"}
                aria-pressed={minutes === String(value)}
                onClick={() => setMinutes(String(value))}
              >
                {value} min
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`${formId}-note`}>Key takeaway (optional)</Label>
          <textarea
            id={`${formId}-note`}
            name="note"
            rows={3}
            maxLength={SESSION_NOTE_MAX_LENGTH}
            placeholder="What stuck with you?"
            aria-invalid={Boolean(errors.note) || undefined}
            className="w-full resize-y rounded-xl border border-border-strong bg-surface px-3.5 py-2.5 text-body text-foreground outline-none placeholder:text-foreground-subtle hover:border-foreground-subtle focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15 aria-invalid:border-danger"
          />
          {errors.note ? (
            <p className="flex items-center gap-1.5 text-body-sm text-danger">
              <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
              {errors.note}
            </p>
          ) : null}
        </div>
        <p role="alert" className="text-body-sm text-danger empty:hidden">
          {failure?.error ?? null}
        </p>
      </form>
    </Modal>
  );
}

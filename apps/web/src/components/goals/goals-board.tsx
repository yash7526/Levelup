"use client";

import type { Goal, GoalStatus, ISODateString } from "@levelup/types";
import {
  APP_LOCALE,
  formatISODate,
  goalProgress,
  MAX_MILESTONES_PER_GOAL,
  MILESTONE_TITLE_MAX_LENGTH,
  pluralize,
  targetState,
  toPercent,
} from "@levelup/utils";
import {
  CalendarDays,
  CirclePause,
  CirclePlay,
  Pencil,
  Plus,
  RotateCcw,
  Target,
  Trash2,
  Trophy,
} from "lucide-react";
import { type FormEvent, useCallback, useOptimistic, useRef, useState, useTransition } from "react";

import {
  changeGoalStatus,
  createMilestone,
  removeGoal,
  removeMilestone,
  setMilestoneComplete,
} from "@/app/(app)/goals/actions";
import { ActionError } from "@/components/growth/action-error";
import { CheckToggle } from "@/components/growth/check-toggle";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ProgressBar } from "@/components/ui/progress";
import { cn } from "@/lib/cn";
import type { ActionResult } from "@/lib/growth/action-result";
import { lifeAreaLabels } from "@/lib/locale";

import { GoalFormDialog } from "./goal-form-dialog";

interface MilestoneChange {
  id: string;
  done: boolean;
}

type Editor = { goal: Goal | null; key: number } | null;

function targetText(goal: Goal, today: ISODateString): { text: string; overdue: boolean } | null {
  const state = targetState(goal.targetDate, today);
  if (state.kind === "none" || !goal.targetDate) return null;
  const date = formatISODate(goal.targetDate, APP_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const done = goal.status === "completed";
  if (done || state.kind === "upcoming") {
    return {
      text:
        done || state.kind !== "upcoming" ? date : `${date} · ${pluralize(state.days, "day")} left`,
      overdue: false,
    };
  }
  if (state.kind === "today") return { text: `${date} · due today`, overdue: false };
  return { text: `${date} · ${pluralize(state.days, "day")} overdue`, overdue: true };
}

function AddMilestone({
  goal,
  onResult,
}: {
  goal: Goal;
  onResult: (result: ActionResult) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const full = goal.milestones.length >= MAX_MILESTONES_PER_GOAL;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = inputRef.current;
    if (!input) return;
    const title = input.value;
    startTransition(async () => {
      const result = await createMilestone(goal.id, title);
      if (result.ok) input.value = "";
      onResult(result);
    });
  }

  if (full) {
    return (
      <p className="text-caption text-foreground-muted">
        Up to {MAX_MILESTONES_PER_GOAL} milestones per goal.
      </p>
    );
  }
  return (
    <form onSubmit={submit} className="flex gap-2">
      <Input
        ref={inputRef}
        aria-label={`Add a milestone to ${goal.title}`}
        placeholder="Add a milestone"
        maxLength={MILESTONE_TITLE_MAX_LENGTH}
        autoComplete="off"
        className="h-10"
      />
      <Button type="submit" variant="secondary" loading={pending} className="h-10">
        {pending ? null : <Plus aria-hidden="true" />}
        Add
      </Button>
    </form>
  );
}

interface GoalsBoardProps {
  today: ISODateString;
  goals: readonly Goal[];
}

export function GoalsBoard({ today, goals }: GoalsBoardProps) {
  const [shown, applyMilestone] = useOptimistic(
    goals,
    (current: readonly Goal[], { id, done }: MilestoneChange) =>
      current.map((goal) => ({
        ...goal,
        milestones: goal.milestones.map((milestone) =>
          milestone.id === id
            ? { ...milestone, completedAt: done ? new Date().toISOString() : null }
            : milestone,
        ),
      })),
  );
  const [, startTransition] = useTransition();
  const [busy, startBusy] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<Editor>(null);
  const [toDelete, setToDelete] = useState<Goal | null>(null);

  const closeEditor = useCallback(() => setEditor(null), []);
  const closeDelete = useCallback(() => setToDelete(null), []);
  const report = (result: ActionResult) => {
    if (!result.ok) setError(result.error);
  };

  function toggleMilestone(id: string, done: boolean) {
    setError(null);
    startTransition(async () => {
      applyMilestone({ id, done });
      report(await setMilestoneComplete(id, done));
    });
  }

  function changeStatus(goal: Goal, status: GoalStatus) {
    setError(null);
    startBusy(async () => report(await changeGoalStatus(goal.id, status)));
  }

  function confirmDelete() {
    if (!toDelete) return;
    const { id } = toDelete;
    startBusy(async () => {
      const result = await removeGoal(id);
      if (result.ok) setToDelete(null);
      else setError(result.error);
    });
  }

  const sections: { status: GoalStatus; title: string }[] = [
    { status: "active", title: "Active" },
    { status: "paused", title: "Paused" },
    { status: "completed", title: "Completed" },
  ];

  return (
    <div className="grid gap-6 lg:gap-8">
      <PageHeader
        title="Goals"
        description="Turn long-term ambitions into milestones you can actually see yourself reach."
        actions={
          shown.length > 0 ? (
            <Button onClick={() => setEditor({ goal: null, key: Date.now() })}>
              <Plus aria-hidden="true" />
              New goal
            </Button>
          ) : undefined
        }
      />

      <ActionError message={error} onDismiss={() => setError(null)} />

      {shown.length === 0 ? (
        <Card>
          <EmptyState
            icon={Target}
            title="No goals yet"
            description="Set a meaningful goal and break it into milestones. Progress is measured by milestones reached, never guessed."
            action={
              <Button onClick={() => setEditor({ goal: null, key: Date.now() })}>
                <Plus aria-hidden="true" />
                Set your first goal
              </Button>
            }
          />
        </Card>
      ) : (
        sections.map(({ status, title }) => {
          const list = shown.filter((goal) => goal.status === status);
          if (list.length === 0) return null;
          return (
            <section key={status} aria-label={`${title} goals`} className="grid gap-4">
              <h2 className="text-overline text-foreground-muted uppercase">
                {title} ({list.length})
              </h2>
              <ul className="grid gap-4 lg:grid-cols-2 lg:gap-5">
                {list.map((goal) => {
                  const progress = goalProgress(goal);
                  const target = targetText(goal, today);
                  return (
                    <li key={goal.id}>
                      <Card className="flex h-full flex-col gap-4">
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-display text-heading-3 break-words">
                              {goal.title}
                            </h3>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              {goal.area ? <Badge>{lifeAreaLabels[goal.area]}</Badge> : null}
                              {target ? (
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 text-caption",
                                    target.overdue ? "text-danger" : "text-foreground-muted",
                                  )}
                                >
                                  <CalendarDays className="size-3.5" aria-hidden="true" />
                                  {target.text}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          {status === "completed" ? (
                            <Trophy
                              className="size-5 shrink-0 text-warning"
                              aria-label="Completed"
                            />
                          ) : null}
                        </div>

                        <div>
                          {progress.total > 0 ? (
                            <>
                              <div className="flex items-baseline justify-between gap-3">
                                <span className="text-caption text-foreground-muted">
                                  {progress.completed} of {pluralize(progress.total, "milestone")}
                                </span>
                                <span className="text-label font-semibold">
                                  {toPercent(progress)}%
                                </span>
                              </div>
                              <ProgressBar
                                value={progress.completed}
                                max={progress.total}
                                label={`${goal.title} progress`}
                                valueText={`${progress.completed} of ${progress.total} milestones`}
                                className="mt-2"
                              />
                            </>
                          ) : (
                            <p className="text-body-sm text-foreground-muted">
                              Add milestones to start measuring progress.
                            </p>
                          )}
                        </div>

                        {goal.milestones.length > 0 ? (
                          <ul className="grid gap-1">
                            {goal.milestones.map((milestone) => {
                              const done = milestone.completedAt !== null;
                              return (
                                <li key={milestone.id} className="flex items-center gap-2.5">
                                  <CheckToggle
                                    checked={done}
                                    label={milestone.title}
                                    onToggle={() => toggleMilestone(milestone.id, !done)}
                                  />
                                  <span
                                    className={cn(
                                      "min-w-0 flex-1 text-body break-words",
                                      done && "text-foreground-muted line-through",
                                    )}
                                  >
                                    {milestone.title}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={`Remove milestone "${milestone.title}"`}
                                    onClick={() =>
                                      startBusy(async () =>
                                        report(await removeMilestone(milestone.id)),
                                      )
                                    }
                                  >
                                    <Trash2 aria-hidden="true" />
                                  </Button>
                                </li>
                              );
                            })}
                          </ul>
                        ) : null}

                        {status !== "completed" ? (
                          <AddMilestone goal={goal} onResult={report} />
                        ) : null}

                        <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditor({ goal, key: Date.now() })}
                          >
                            <Pencil aria-hidden="true" />
                            Edit
                          </Button>
                          {status === "active" ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={busy}
                                onClick={() => changeStatus(goal, "paused")}
                              >
                                <CirclePause aria-hidden="true" />
                                Pause
                              </Button>
                              <Button
                                variant="accent"
                                size="sm"
                                disabled={busy}
                                onClick={() => changeStatus(goal, "completed")}
                              >
                                <Trophy aria-hidden="true" />
                                Mark complete
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={busy}
                              onClick={() => changeStatus(goal, "active")}
                            >
                              {status === "paused" ? (
                                <CirclePlay aria-hidden="true" />
                              ) : (
                                <RotateCcw aria-hidden="true" />
                              )}
                              {status === "paused" ? "Resume" : "Reopen"}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto text-danger"
                            onClick={() => setToDelete(goal)}
                          >
                            <Trash2 aria-hidden="true" />
                            Delete
                          </Button>
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })
      )}

      {editor ? <GoalFormDialog key={editor.key} goal={editor.goal} onClose={closeEditor} /> : null}

      <Modal
        open={toDelete !== null}
        onClose={closeDelete}
        size="sm"
        title={toDelete ? `Delete ${toDelete.title}?` : "Delete goal?"}
        description="This permanently removes the goal and all of its milestones. This can't be undone."
        footer={
          <>
            <Button variant="outline" onClick={closeDelete}>
              Cancel
            </Button>
            <Button variant="danger" loading={busy} onClick={confirmDelete}>
              Delete goal
            </Button>
          </>
        }
      />
    </div>
  );
}

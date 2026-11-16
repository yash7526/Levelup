"use client";

import type { Habit, HabitSummary, ISODateString } from "@levelup/types";
import { describeSchedule, describeStreak, previewCheckin } from "@levelup/utils";
import { Archive, ArchiveRestore, Flame, Pencil, Plus, Repeat } from "lucide-react";
import { useCallback, useOptimistic, useState, useTransition } from "react";

import { archiveHabit, restoreHabit, setCheckin } from "@/app/(app)/habits/actions";
import { ActionError } from "@/components/growth/action-error";
import { CheckToggle } from "@/components/growth/check-toggle";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";
import { lifeAreaLabels } from "@/lib/locale";

import { HabitDayLegend, HabitDayStrip } from "./habit-day-strip";
import { HabitFormDialog } from "./habit-form-dialog";

export interface HabitModel {
  habit: Habit;
  summary: HabitSummary;
  /** The first calendar day the habit existed. */
  start: ISODateString;
}

interface CheckinChange {
  id: string;
  day: ISODateString;
  done: boolean;
}

interface HabitsBoardProps {
  today: ISODateString;
  /** The last seven days, oldest first. */
  days: readonly ISODateString[];
  active: readonly HabitModel[];
  archived: readonly Habit[];
}

type Editor = { habit: Habit | null; key: number } | null;

export function HabitsBoard({ today, days, active, archived }: HabitsBoardProps) {
  const [habits, applyCheckin] = useOptimistic(
    active,
    (current: readonly HabitModel[], { id, day, done }: CheckinChange) =>
      current.map((model) =>
        model.habit.id === id
          ? {
              ...model,
              summary: previewCheckin(model.summary, { day, done, today, start: model.start }),
            }
          : model,
      ),
  );
  const [, startTransition] = useTransition();
  const [restoring, startRestore] = useTransition();
  const [archiving, startArchive] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<Editor>(null);
  const [toArchive, setToArchive] = useState<Habit | null>(null);

  const openEditor = (habit: Habit | null) => setEditor({ habit, key: Date.now() });
  const closeEditor = useCallback(() => setEditor(null), []);
  const closeArchive = useCallback(() => setToArchive(null), []);

  function toggle(id: string, day: ISODateString, done: boolean) {
    setError(null);
    startTransition(async () => {
      applyCheckin({ id, day, done });
      const result = await setCheckin(id, day, done);
      if (!result.ok) setError(result.error);
    });
  }

  function confirmArchive() {
    if (!toArchive) return;
    const { id } = toArchive;
    startArchive(async () => {
      const result = await archiveHabit(id);
      if (result.ok) setToArchive(null);
      else setError(result.error);
    });
  }

  function restore(id: string) {
    setError(null);
    startRestore(async () => {
      const result = await restoreHabit(id);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="grid gap-6 lg:gap-8">
      <PageHeader
        title="Habits"
        description="Small, repeatable actions that compound into who you become."
        actions={
          habits.length > 0 ? (
            <Button onClick={() => openEditor(null)}>
              <Plus aria-hidden="true" />
              New habit
            </Button>
          ) : undefined
        }
      />

      <ActionError message={error} onDismiss={() => setError(null)} />

      {habits.length === 0 ? (
        <Card>
          <EmptyState
            icon={Repeat}
            title="No habits yet"
            description="Start with one habit small enough to do on your worst day. Consistency beats intensity."
            action={
              <Button onClick={() => openEditor(null)}>
                <Plus aria-hidden="true" />
                Create your first habit
              </Button>
            }
          />
        </Card>
      ) : (
        <section aria-label="Your habits" className="grid gap-4">
          <HabitDayLegend />
          <ul className="grid gap-4 lg:grid-cols-2 lg:gap-5">
            {habits.map(({ habit, summary, start }) => (
              <li key={habit.id}>
                <Card className="flex h-full flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <CheckToggle
                      size="lg"
                      checked={summary.completedToday}
                      label={`${habit.name}, done today`}
                      onToggle={() => toggle(habit.id, today, !summary.completedToday)}
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-label font-semibold text-foreground">
                        {habit.name}
                      </h3>
                      <p className="mt-0.5 text-caption text-foreground-muted">
                        {describeSchedule(habit.schedule)}
                        {habit.area ? ` · ${lifeAreaLabels[habit.area]}` : ""}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-caption text-foreground-muted">
                        <span className="inline-flex items-center gap-1">
                          <Flame
                            className={cn(
                              "size-3.5",
                              summary.currentStreak > 0 ? "text-warning" : "text-foreground-subtle",
                            )}
                            aria-hidden="true"
                          />
                          {describeStreak(summary)}
                        </span>
                        {summary.weekProgress ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>
                              {summary.weekProgress.completed} of {summary.weekProgress.total} this
                              week
                            </span>
                          </>
                        ) : null}
                      </p>
                    </div>
                    <div className="-mt-1 -mr-2 flex shrink-0">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${habit.name}`}
                        onClick={() => openEditor(habit)}
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Archive ${habit.name}`}
                        onClick={() => setToArchive(habit)}
                      >
                        <Archive aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                  <HabitDayStrip
                    days={days}
                    statuses={summary.recentDays}
                    start={start}
                    onToggle={(day, done) => toggle(habit.id, day, done)}
                    className="mt-auto"
                  />
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      {archived.length > 0 ? (
        <details className="group rounded-2xl border border-border px-5 py-4 sm:px-6">
          <summary className="cursor-pointer text-label text-foreground-muted marker:text-foreground-subtle">
            Archived habits ({archived.length})
          </summary>
          <ul className="mt-3 divide-y divide-border">
            {archived.map((habit) => (
              <li key={habit.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body">{habit.name}</p>
                  <p className="text-caption text-foreground-muted">
                    {describeSchedule(habit.schedule)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={restoring}
                  onClick={() => restore(habit.id)}
                >
                  <ArchiveRestore aria-hidden="true" />
                  Restore
                </Button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {editor ? (
        <HabitFormDialog key={editor.key} habit={editor.habit} onClose={closeEditor} />
      ) : null}

      <Modal
        open={toArchive !== null}
        onClose={closeArchive}
        size="sm"
        title={toArchive ? `Archive ${toArchive.name}?` : "Archive habit?"}
        description="It leaves Today and your dashboard. Its history is kept, and you can restore it from Archived habits."
        footer={
          <>
            <Button variant="outline" onClick={closeArchive}>
              Cancel
            </Button>
            <Button variant="danger" loading={archiving} onClick={confirmArchive}>
              Archive habit
            </Button>
          </>
        }
      />
    </div>
  );
}

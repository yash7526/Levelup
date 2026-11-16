"use client";

import type { HabitSummary, ISODateString, PriorityEntry } from "@levelup/types";
import {
  APP_LOCALE,
  describeSchedule,
  describeStreak,
  formatISODate,
  MAX_PRIORITIES_PER_DAY,
  previewCheckin,
  summarizeTodayProgress,
} from "@levelup/utils";
import { ArrowUp, Flame, ListChecks, Moon, Repeat, Trash2 } from "lucide-react";
import { useMemo, useOptimistic, useState, useTransition } from "react";

import { setCheckin } from "@/app/(app)/habits/actions";
import { moveToToday, removePriority, setPriorityDone } from "@/app/(app)/today/actions";
import { ViewAllLink } from "@/components/dashboard/view-all-link";
import { ActionError } from "@/components/growth/action-error";
import { CheckToggle } from "@/components/growth/check-toggle";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressRing } from "@/components/ui/progress";
import { cn } from "@/lib/cn";
import type { ActionResult } from "@/lib/growth/action-result";
import { lifeAreaLabels } from "@/lib/locale";

import { AddPriorityForm } from "./add-priority-form";

interface PlannerState {
  priorities: readonly PriorityEntry[];
  carryOver: readonly PriorityEntry[];
  habits: readonly HabitSummary[];
}

type Change =
  | { type: "priority-done"; id: string; done: boolean }
  | { type: "priority-remove"; id: string }
  | { type: "priority-move"; id: string }
  | { type: "habit"; id: string; done: boolean };

function applyChange(state: PlannerState, change: Change, today: ISODateString): PlannerState {
  switch (change.type) {
    case "priority-done":
      return {
        ...state,
        priorities: state.priorities.map((priority) =>
          priority.id === change.id
            ? { ...priority, status: change.done ? "done" : "open" }
            : priority,
        ),
      };
    case "priority-remove":
      return {
        ...state,
        priorities: state.priorities.filter((priority) => priority.id !== change.id),
        carryOver: state.carryOver.filter((priority) => priority.id !== change.id),
      };
    case "priority-move": {
      const moved = state.carryOver.find((priority) => priority.id === change.id);
      if (!moved) return state;
      return {
        ...state,
        priorities: [...state.priorities, { ...moved, day: today }],
        carryOver: state.carryOver.filter((priority) => priority.id !== change.id),
      };
    }
    case "habit":
      return {
        ...state,
        habits: state.habits.map((habit) =>
          habit.id === change.id
            ? previewCheckin(habit, { day: today, done: change.done, today, start: today })
            : habit,
        ),
      };
  }
}

interface TodayPlannerProps {
  today: ISODateString;
  priorities: readonly PriorityEntry[];
  carryOver: readonly PriorityEntry[];
  habits: readonly HabitSummary[];
}

/** Today's priorities, unfinished ones from earlier days, and today's habits. */
export function TodayPlanner({ today, priorities, carryOver, habits }: TodayPlannerProps) {
  const base = useMemo<PlannerState>(
    () => ({ priorities, carryOver, habits }),
    [priorities, carryOver, habits],
  );
  const [state, applyOptimistic] = useOptimistic(base, (current: PlannerState, change: Change) =>
    applyChange(current, change, today),
  );
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  /** Shows the change at once, saves it, and reports a failure (the change then reverts). */
  function run(change: Change, save: () => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      applyOptimistic(change);
      const result = await save();
      if (!result.ok) setError(result.error);
    });
  }

  const slotsLeft = Math.max(0, MAX_PRIORITIES_PER_DAY - state.priorities.length);
  const progress = summarizeTodayProgress(state.priorities, state.habits);
  const dueHabits = state.habits.filter((habit) => habit.dueToday || habit.completedToday);
  const restingCount = state.habits.length - dueHabits.length;

  return (
    <div className="grid gap-4 lg:gap-5">
      <ActionError message={error} onDismiss={() => setError(null)} />

      <Card as="section" aria-labelledby="today-progress-title" className="flex items-center gap-5">
        <ProgressRing
          value={progress.overall.completed}
          max={Math.max(progress.overall.total, 1)}
          label="Today's progress"
          valueText={`${progress.overall.completed} of ${progress.overall.total} done`}
          size={64}
          strokeWidth={7}
        >
          <span className="text-label font-semibold tabular-nums">{progress.percent}%</span>
        </ProgressRing>
        <div className="min-w-0">
          <h2 id="today-progress-title" className="font-display text-heading-3">
            {progress.overall.total === 0
              ? "Nothing planned yet"
              : `${progress.overall.completed} of ${progress.overall.total} done`}
          </h2>
          <p className="mt-0.5 text-body-sm text-foreground-muted">
            Priorities {progress.priorities.completed} of {progress.priorities.total} · Habits due
            today {progress.habits.completed} of {progress.habits.total}
          </p>
        </div>
      </Card>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-5">
        <div className="grid gap-4 lg:gap-5">
          <Card as="section" aria-labelledby="priorities-title">
            <CardHeader>
              <div className="min-w-0">
                <CardTitle id="priorities-title">Priorities</CardTitle>
                <CardDescription>
                  {state.priorities.length === 0
                    ? "Up to three things that would make today a win."
                    : `${progress.priorities.completed} of ${state.priorities.length} complete`}
                </CardDescription>
              </div>
            </CardHeader>

            {state.priorities.length > 0 ? (
              <ol className="mb-5 grid gap-2">
                {state.priorities.map((priority) => {
                  const done = priority.status === "done";
                  return (
                    <li
                      key={priority.id}
                      className="flex min-h-14 items-center gap-3 rounded-xl bg-surface-muted/70 py-2 pr-1.5 pl-3"
                    >
                      <CheckToggle
                        checked={done}
                        label={priority.title}
                        onToggle={() =>
                          run({ type: "priority-done", id: priority.id, done: !done }, () =>
                            setPriorityDone(priority.id, !done),
                          )
                        }
                      />
                      <span
                        className={cn(
                          "min-w-0 flex-1 text-body break-words",
                          done &&
                            "text-foreground-muted line-through decoration-foreground-subtle/60",
                        )}
                      >
                        {priority.title}
                      </span>
                      {priority.area ? (
                        <Badge className="hidden sm:inline-flex">
                          {lifeAreaLabels[priority.area]}
                        </Badge>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove "${priority.title}"`}
                        onClick={() =>
                          run({ type: "priority-remove", id: priority.id }, () =>
                            removePriority(priority.id),
                          )
                        }
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <EmptyState
                icon={ListChecks}
                title="No priorities yet"
                description="Fewer priorities, more follow-through. Start with the one thing that matters most."
                className="mb-5"
              />
            )}

            {slotsLeft > 0 ? (
              <AddPriorityForm slotsLeft={slotsLeft} />
            ) : (
              <p className="border-t border-border pt-5 text-body-sm text-foreground-muted">
                That&apos;s three priorities, today&apos;s limit. Finish or remove one to add
                another.
              </p>
            )}
          </Card>

          {state.carryOver.length > 0 ? (
            <Card as="section" aria-labelledby="carry-over-title">
              <CardHeader>
                <div className="min-w-0">
                  <CardTitle id="carry-over-title">Unfinished from earlier</CardTitle>
                  <CardDescription>
                    From the last two weeks. Bring one into today, or let it go.
                  </CardDescription>
                </div>
              </CardHeader>
              <ul className="-my-1 divide-y divide-border">
                {state.carryOver.map((priority) => (
                  <li
                    key={priority.id}
                    className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3"
                  >
                    <div className="min-w-0 flex-1 basis-48">
                      <p className="text-body break-words">{priority.title}</p>
                      <p className="mt-0.5 text-caption text-foreground-muted">
                        {formatISODate(priority.day, APP_LOCALE, {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                        {priority.area ? ` · ${lifeAreaLabels[priority.area]}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={slotsLeft === 0}
                        title={slotsLeft === 0 ? "Today already has three priorities" : undefined}
                        onClick={() =>
                          run({ type: "priority-move", id: priority.id }, () =>
                            moveToToday(priority.id),
                          )
                        }
                      >
                        <ArrowUp aria-hidden="true" />
                        Move to today
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove "${priority.title}"`}
                        onClick={() =>
                          run({ type: "priority-remove", id: priority.id }, () =>
                            removePriority(priority.id),
                          )
                        }
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              {slotsLeft === 0 ? (
                <p className="mt-3 text-body-sm text-foreground-muted">
                  Today is full. Finish or remove a priority to bring one forward.
                </p>
              ) : null}
            </Card>
          ) : null}
        </div>

        <Card as="section" aria-labelledby="today-habits-title">
          <CardHeader>
            <div className="min-w-0">
              <CardTitle id="today-habits-title">Today&apos;s habits</CardTitle>
              <CardDescription>
                {dueHabits.length > 0
                  ? `${progress.habits.completed} of ${progress.habits.total} done`
                  : "Small actions that compound"}
              </CardDescription>
            </div>
            {state.habits.length > 0 ? <ViewAllLink href="/habits" label="Manage" /> : null}
          </CardHeader>

          {state.habits.length === 0 ? (
            <EmptyState
              icon={Repeat}
              title="No habits yet"
              description="Start with one habit small enough to do on your worst day."
              action={
                <ButtonLink href="/habits" variant="primary" size="sm">
                  Create a habit
                </ButtonLink>
              }
            />
          ) : dueHabits.length === 0 ? (
            <EmptyState
              icon={Moon}
              title="Nothing scheduled today"
              description="None of your habits are due today. Rest days are part of the plan."
            />
          ) : (
            <ul className="-my-1 divide-y divide-border">
              {dueHabits.map((habit) => (
                <li key={habit.id} className="flex items-center gap-3 py-3">
                  <CheckToggle
                    size="lg"
                    checked={habit.completedToday}
                    label={habit.name}
                    onToggle={() =>
                      run({ type: "habit", id: habit.id, done: !habit.completedToday }, () =>
                        setCheckin(habit.id, today, !habit.completedToday),
                      )
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label text-foreground">{habit.name}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-caption text-foreground-muted">
                      <span>{describeSchedule(habit.schedule)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Flame
                          className={cn(
                            "size-3.5",
                            habit.currentStreak > 0 ? "text-warning" : "text-foreground-subtle",
                          )}
                          aria-hidden="true"
                        />
                        {describeStreak(habit)}
                      </span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {restingCount > 0 && dueHabits.length > 0 ? (
            <p className="mt-4 text-body-sm text-foreground-muted">
              {restingCount === 1
                ? "1 other habit isn't due today."
                : `${restingCount} other habits aren't due today.`}
            </p>
          ) : null}
        </Card>
      </div>
    </div>
  );
}

"use client";

import type { ISODateString, LearningItem, LearningSession } from "@levelup/types";
import {
  APP_LOCALE,
  formatISODate,
  learningProgress,
  learningUnitLabels,
  pluralize,
  sessionMinutesThisWeek,
  studyStreak,
  toPercent,
} from "@levelup/utils";
import {
  Archive,
  ArchiveRestore,
  BookOpen,
  Flame,
  Minus,
  Pencil,
  Plus,
  Timer,
  Trash2,
} from "lucide-react";
import { useCallback, useOptimistic, useState, useTransition } from "react";

import { archiveLearningItem, removeSession, setItemProgress } from "@/app/(app)/learning/actions";
import { ActionError } from "@/components/growth/action-error";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress";
import type { ActionResult } from "@/lib/growth/action-result";

import { LearningFormDialog } from "./learning-form-dialog";
import { LogSessionDialog } from "./log-session-dialog";

const kindLabels = { course: "Course", book: "Book", skill: "Skill", article: "Article" } as const;

interface ProgressChange {
  id: string;
  completed: number;
}

type Editor = { item: LearningItem | null; key: number } | null;

interface LearningBoardProps {
  today: ISODateString;
  items: readonly LearningItem[];
  sessions: readonly LearningSession[];
}

function minutesText(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function LearningBoard({ today, items, sessions }: LearningBoardProps) {
  const [shown, applyProgress] = useOptimistic(
    items,
    (current: readonly LearningItem[], { id, completed }: ProgressChange) =>
      current.map((item) => (item.id === id ? { ...item, completed } : item)),
  );
  const [, startTransition] = useTransition();
  const [busy, startBusy] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<Editor>(null);
  const [logging, setLogging] = useState<LearningItem | null>(null);

  const closeEditor = useCallback(() => setEditor(null), []);
  const closeLogging = useCallback(() => setLogging(null), []);
  const report = (result: ActionResult) => {
    if (!result.ok) setError(result.error);
  };

  const active = shown.filter((item) => item.archivedAt === null);
  const archived = shown.filter((item) => item.archivedAt !== null);
  const titles = new Map(items.map((item) => [item.id, item.title]));
  const recent = sessions.slice(0, 8);
  const weekMinutes = sessionMinutesThisWeek(sessions, today);
  const streak = studyStreak(sessions, today);

  function step(item: LearningItem, delta: number) {
    const completed = Math.min(Math.max(item.completed + delta, 0), item.total);
    if (completed === item.completed) return;
    setError(null);
    startTransition(async () => {
      applyProgress({ id: item.id, completed });
      report(await setItemProgress(item, completed));
    });
  }

  return (
    <div className="grid gap-6 lg:gap-8">
      <PageHeader
        title="Learning"
        description="Keep the courses, books and skills you're working through moving forward."
        actions={
          shown.length > 0 ? (
            <Button onClick={() => setEditor({ item: null, key: Date.now() })}>
              <Plus aria-hidden="true" />
              Add item
            </Button>
          ) : undefined
        }
      />

      <ActionError message={error} onDismiss={() => setError(null)} />

      {shown.length === 0 ? (
        <Card>
          <EmptyState
            icon={BookOpen}
            title="Your library is empty"
            description="Add a course, book, skill or article, track it by lessons, chapters, pages or modules, and log short sessions as you go."
            action={
              <Button onClick={() => setEditor({ item: null, key: Date.now() })}>
                <Plus aria-hidden="true" />
                Add your first item
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {sessions.length > 0 ? (
            <Card
              as="section"
              aria-label="Study summary"
              className="flex flex-wrap gap-x-8 gap-y-3"
            >
              <div>
                <p className="text-caption text-foreground-muted">This week</p>
                <p className="font-display text-heading-3">{minutesText(weekMinutes)}</p>
              </div>
              <div>
                <p className="text-caption text-foreground-muted">Study streak</p>
                <p className="flex items-center gap-1.5 font-display text-heading-3">
                  <Flame
                    className={streak > 0 ? "size-5 text-warning" : "size-5 text-foreground-subtle"}
                    aria-hidden="true"
                  />
                  {pluralize(streak, "day")}
                </p>
              </div>
            </Card>
          ) : null}

          {active.length > 0 ? (
            <ul className="grid gap-4 lg:grid-cols-2 lg:gap-5">
              {active.map((item) => {
                const progress = learningProgress(item);
                const unit = learningUnitLabels[item.unit];
                const finished = progress.completed >= progress.total;
                return (
                  <li key={item.id}>
                    <Card className="flex h-full flex-col gap-4">
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-heading-3 break-words">{item.title}</h3>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <Badge>{kindLabels[item.kind]}</Badge>
                            {finished ? <Badge variant="success">Finished</Badge> : null}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-caption text-foreground-muted">
                            {progress.completed} of {progress.total} {unit.plural}
                          </span>
                          <span className="text-label font-semibold">{toPercent(progress)}%</span>
                        </div>
                        <ProgressBar
                          value={progress.completed}
                          max={progress.total}
                          label={`${item.title} progress`}
                          valueText={`${progress.completed} of ${progress.total} ${unit.plural}`}
                          className="mt-2"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          aria-label={`One ${unit.singular} less`}
                          disabled={progress.completed <= 0}
                          onClick={() => step(item, -1)}
                        >
                          <Minus aria-hidden="true" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={finished}
                          onClick={() => step(item, 1)}
                        >
                          <Plus aria-hidden="true" />
                          Finished a {unit.singular}
                        </Button>
                      </div>

                      <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-4">
                        <Button size="sm" onClick={() => setLogging(item)}>
                          <Timer aria-hidden="true" />
                          Log session
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditor({ item, key: Date.now() })}
                        >
                          <Pencil aria-hidden="true" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy}
                          className="ml-auto"
                          onClick={() =>
                            startBusy(async () => report(await archiveLearningItem(item.id, true)))
                          }
                        >
                          <Archive aria-hidden="true" />
                          Archive
                        </Button>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Card>
              <EmptyState
                icon={BookOpen}
                title="Nothing in progress"
                description="Everything is archived. Restore an item below or add something new."
              />
            </Card>
          )}

          {recent.length > 0 ? (
            <Card as="section" aria-labelledby="recent-sessions-title">
              <CardTitle id="recent-sessions-title">Recent sessions</CardTitle>
              <CardDescription>Your latest study sessions across the library.</CardDescription>
              <ul className="mt-4 divide-y divide-border">
                {recent.map((session) => (
                  <li key={session.id} className="flex items-start gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-label break-words">
                        {titles.get(session.itemId) ?? "Archived item"}
                      </p>
                      <p className="text-caption text-foreground-muted">
                        {formatISODate(session.day, APP_LOCALE, {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        · {minutesText(session.minutes)}
                      </p>
                      {session.note ? (
                        <p className="mt-1 text-body-sm break-words text-foreground">
                          {session.note}
                        </p>
                      ) : null}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove this session"
                      disabled={busy}
                      onClick={() => startBusy(async () => report(await removeSession(session.id)))}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </>
      )}

      {archived.length > 0 ? (
        <details className="rounded-2xl border border-border px-5 py-4 sm:px-6">
          <summary className="cursor-pointer text-label text-foreground-muted">
            Archived items ({archived.length})
          </summary>
          <ul className="mt-3 divide-y divide-border">
            {archived.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body">{item.title}</p>
                  <p className="text-caption text-foreground-muted">
                    {item.completed} of {item.total} {learningUnitLabels[item.unit].plural}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    startBusy(async () => report(await archiveLearningItem(item.id, false)))
                  }
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
        <LearningFormDialog key={editor.key} item={editor.item} onClose={closeEditor} />
      ) : null}
      {logging ? <LogSessionDialog key={logging.id} item={logging} onClose={closeLogging} /> : null}
    </div>
  );
}

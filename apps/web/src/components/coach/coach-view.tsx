import type { CoachFocus, CoachInsight, CoachReport } from "@levelup/types";
import { pluralize, toPercent } from "@levelup/utils";
import {
  ArrowRight,
  CalendarCheck,
  Lightbulb,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import type { Route } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress";
import { cn } from "@/lib/cn";

const focusRoutes: Record<CoachFocus, { href: Route; label: string }> = {
  today: { href: "/today", label: "Open Today" },
  habits: { href: "/habits", label: "Open Habits" },
  goals: { href: "/goals", label: "Open Goals" },
  learning: { href: "/learning", label: "Open Learning" },
};

const tones = {
  celebrate: {
    icon: PartyPopper,
    badge: "success",
    label: "Win",
    tile: "bg-success-subtle text-success",
  },
  nudge: {
    icon: TriangleAlert,
    badge: "warning",
    label: "Needs attention",
    tile: "bg-warning-subtle text-warning",
  },
  info: {
    icon: Lightbulb,
    badge: "neutral",
    label: "Idea",
    tile: "bg-surface-muted text-foreground-muted",
  },
} as const;

function InsightCard({ insight }: { insight: CoachInsight }) {
  const tone = tones[insight.tone ?? "info"];
  const Icon = tone.icon;
  const focus = insight.focus ? focusRoutes[insight.focus] : null;
  return (
    <Card as="article" className="flex gap-4">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tone.tile)}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <Badge variant={tone.badge}>{tone.label}</Badge>
        <p className="mt-2 text-body text-pretty break-words text-foreground">{insight.message}</p>
        {insight.suggestion ? (
          <p className="mt-2 text-body-sm text-foreground-muted">
            <span className="font-semibold text-foreground">Next step: </span>
            {insight.suggestion}
          </p>
        ) : null}
        {focus ? (
          <ButtonLink href={focus.href} variant="outline" size="sm" className="mt-3">
            {focus.label}
            <ArrowRight aria-hidden="true" />
          </ButtonLink>
        ) : null}
      </div>
    </Card>
  );
}

interface CoachViewProps {
  report: CoachReport;
  /** Set when goals and learning couldn't be loaded, so the coach had less to go on. */
  planningError: string | null;
}

export function CoachView({ report, planningError }: CoachViewProps) {
  const { week } = report;
  const habitDone = toPercent(week.habitDays);
  const hasWeek =
    week.priorities.total > 0 ||
    week.habitCheckins > 0 ||
    week.habitDays.total > 0 ||
    week.learningMinutes > 0 ||
    week.milestonesCompleted > 0;

  return (
    <div className="grid gap-6 lg:gap-8">
      <PageHeader
        title="AI Coach"
        description="Guidance grounded in your own habits, goals, learning and priorities."
      />

      {planningError ? (
        <aside
          aria-label="Goals and learning unavailable"
          className="flex gap-3 rounded-2xl border border-dashed border-warning/50 bg-warning-subtle p-4 sm:p-5"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
          <p className="text-body-sm text-foreground-muted">
            {planningError} Until goals and learning load, the coach is only looking at your habits
            and priorities.
          </p>
        </aside>
      ) : null}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-5">
        <section aria-labelledby="coach-insights-title" className="grid gap-4">
          <h2 id="coach-insights-title" className="text-overline text-foreground-muted uppercase">
            What the coach noticed
          </h2>
          {report.insights.length > 0 ? (
            report.insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)
          ) : (
            <Card>
              <EmptyState
                icon={Sparkles}
                title="Nothing to point out"
                description="The coach looks at what you track. Add a habit, a goal or a priority and it will have something to say."
              />
            </Card>
          )}
        </section>

        <div className="grid gap-4">
          <Card as="section" aria-labelledby="week-title">
            <div className="flex items-center gap-2">
              <CalendarCheck className="size-5 text-primary" aria-hidden="true" />
              <CardTitle id="week-title">This week so far</CardTitle>
            </div>
            <CardDescription>Monday through today, from your records.</CardDescription>
            {hasWeek ? (
              <dl className="mt-4 grid gap-3 text-body-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-foreground-muted">Priorities done</dt>
                  <dd className="font-semibold tabular-nums">
                    {week.priorities.completed} of {week.priorities.total}
                  </dd>
                </div>
                <div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-foreground-muted">Scheduled habit days done</dt>
                    <dd className="font-semibold tabular-nums">
                      {week.habitDays.total > 0
                        ? `${week.habitDays.completed} of ${week.habitDays.total}`
                        : "None scheduled"}
                    </dd>
                  </div>
                  {week.habitDays.total > 0 ? (
                    <ProgressBar
                      value={week.habitDays.completed}
                      max={week.habitDays.total}
                      label="Scheduled habit days done this week"
                      valueText={`${habitDone}%`}
                      size="sm"
                      className="mt-2"
                    />
                  ) : null}
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-foreground-muted">Habit check-ins</dt>
                  <dd className="font-semibold tabular-nums">{week.habitCheckins}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-foreground-muted">Milestones reached</dt>
                  <dd className="font-semibold tabular-nums">{week.milestonesCompleted}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-foreground-muted">Time studying</dt>
                  <dd className="font-semibold tabular-nums">
                    {week.learningMinutes > 0
                      ? pluralize(week.learningMinutes, "minute")
                      : "None yet"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-4 text-body-sm text-foreground-muted">
                Nothing recorded this week yet.
              </p>
            )}
          </Card>

          <Card as="section" variant="muted" aria-labelledby="coach-how-title">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
              <h2 id="coach-how-title" className="font-display text-heading-3">
                How the coach works
              </h2>
            </div>
            <p className="mt-2 text-body-sm text-foreground-muted">
              These insights come from simple, transparent rules applied to your own records: your
              streaks, target dates, progress and study sessions. Each message states the numbers it
              is based on. There is no language model, and your data isn&apos;t sent anywhere to
              produce them.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

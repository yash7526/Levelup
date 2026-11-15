import type { TodayProgress } from "@levelup/utils";
import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress";

import { DashboardCard } from "./dashboard-card";

interface TodayProgressCardProps {
  progress: TodayProgress;
  isDemo: boolean;
  className?: string;
}

function Breakdown({
  label,
  completed,
  total,
}: {
  label: string;
  completed: number;
  total: number;
}) {
  return (
    <div className="rounded-xl bg-brand-foreground/8 px-3.5 py-3">
      <dt className="text-caption text-brand-muted">{label}</dt>
      <dd className="mt-0.5 text-body font-semibold text-brand-foreground">
        {total === 0 ? "None set" : `${completed} of ${total}`}
      </dd>
    </div>
  );
}

export function TodayProgressCard({ progress, isDemo, className }: TodayProgressCardProps) {
  const { overall, percent } = progress;
  const hasPlan = overall.total > 0;

  return (
    <DashboardCard
      id="today-progress"
      title="Today's progress"
      description={hasPlan ? "Priorities and habits due today" : "Nothing planned yet"}
      variant="brand"
      isDemo={isDemo}
      className={className}
    >
      <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:items-center lg:flex-col lg:items-stretch xl:flex-row xl:items-center">
        <ProgressRing
          value={overall.completed}
          max={Math.max(overall.total, 1)}
          label="Today's progress"
          valueText={
            hasPlan ? `${overall.completed} of ${overall.total} done` : "Nothing planned yet"
          }
          tone="onBrand"
          size={136}
          strokeWidth={11}
          className="self-center"
        >
          <div>
            <p className="font-sans text-[2.5rem] leading-none font-semibold tracking-tight text-brand-foreground">
              {percent}
              <span className="text-heading-3 font-semibold text-brand-muted">%</span>
            </p>
            <p className="mt-1 text-caption text-brand-muted">
              {hasPlan ? `${overall.completed} of ${overall.total}` : "complete"}
            </p>
          </div>
        </ProgressRing>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {hasPlan ? (
            <dl className="grid grid-cols-2 gap-2">
              <Breakdown label="Priorities" {...progress.priorities} />
              <Breakdown label="Habits" {...progress.habits} />
            </dl>
          ) : (
            <p className="text-body-sm text-brand-muted">
              Set today&apos;s priorities or start a habit, and your progress will appear here as
              you complete them.
            </p>
          )}
          <ButtonLink href="/today" variant="accent" size="sm" className="self-start">
            {hasPlan ? "Open today's plan" : "Plan today"}
            <ArrowRight aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>
    </DashboardCard>
  );
}

import type { GoalSummary } from "@levelup/types";
import { formatMonthYear, toPercent } from "@levelup/utils";
import { Target } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress";
import { APP_LOCALE } from "@/lib/locale";

import { DashboardCard } from "./dashboard-card";
import { ViewAllLink } from "./view-all-link";

interface GoalsCardProps {
  goals: readonly GoalSummary[];
  isDemo: boolean;
  className?: string;
}

export function GoalsCard({ goals, isDemo, className }: GoalsCardProps) {
  const active = goals.filter((goal) => goal.status === "active");
  const hasGoals = active.length > 0;

  return (
    <DashboardCard
      id="goals"
      title="Active goals"
      description={hasGoals ? `${active.length} in progress` : "Where you're heading"}
      isDemo={isDemo}
      action={hasGoals ? <ViewAllLink href="/goals" label="All goals" /> : undefined}
      className={className}
    >
      {hasGoals ? (
        <ul className="grid gap-5">
          {active.map((goal) => {
            const { completed, total } = goal.milestones;
            const percent = toPercent(goal.milestones);
            return (
              <li key={goal.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="min-w-0 truncate text-label text-foreground">{goal.title}</p>
                  <span className="shrink-0 text-label font-semibold text-foreground">
                    {percent}%
                  </span>
                </div>
                <ProgressBar
                  value={completed}
                  max={total}
                  label={`${goal.title} progress`}
                  valueText={`${completed} of ${total} milestones`}
                  className="mt-2"
                />
                <p className="mt-1.5 text-caption text-foreground-muted">
                  {completed} of {total} milestones
                  {goal.targetDate
                    ? ` · Target ${formatMonthYear(goal.targetDate, APP_LOCALE)}`
                    : null}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={Target}
          title="No active goals"
          description="Set a meaningful goal and break it into milestones you can see yourself reach."
          action={
            <ButtonLink href="/goals" variant="primary" size="sm">
              Explore Goals
            </ButtonLink>
          }
        />
      )}
    </DashboardCard>
  );
}

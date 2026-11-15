import type { Priority } from "@levelup/types";
import { Circle, CircleCheck, ListChecks } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import { lifeAreaLabels } from "@/lib/locale";

import { DashboardCard } from "./dashboard-card";
import { ViewAllLink } from "./view-all-link";

interface PrioritiesCardProps {
  priorities: readonly Priority[];
  isDemo: boolean;
  className?: string;
}

export function PrioritiesCard({ priorities, isDemo, className }: PrioritiesCardProps) {
  const done = priorities.filter((priority) => priority.status === "done").length;
  const hasPriorities = priorities.length > 0;

  return (
    <DashboardCard
      id="priorities"
      title="Today's priorities"
      description={
        hasPriorities
          ? `${done} of ${priorities.length} complete`
          : "The few things that would make today a win"
      }
      isDemo={isDemo}
      action={hasPriorities ? <ViewAllLink href="/today" label="Open Today" /> : undefined}
      className={className}
    >
      {hasPriorities ? (
        <ol className="grid gap-2">
          {priorities.map((priority) => {
            const isDone = priority.status === "done";
            const Icon = isDone ? CircleCheck : Circle;
            return (
              <li
                key={priority.id}
                className="flex min-h-14 items-center gap-3 rounded-xl bg-surface-muted/70 px-3.5 py-3"
              >
                <Icon
                  className={cn(
                    "size-5 shrink-0",
                    isDone ? "text-success" : "text-foreground-subtle",
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "min-w-0 flex-1 text-body",
                    isDone && "text-foreground-muted line-through decoration-foreground-subtle/60",
                  )}
                >
                  {priority.title}
                  <span className="sr-only">{isDone ? " (done)" : " (to do)"}</span>
                </span>
                {priority.area ? (
                  <Badge className="hidden sm:inline-flex">{lifeAreaLabels[priority.area]}</Badge>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : (
        <EmptyState
          icon={ListChecks}
          title="No priorities yet"
          description="Choose up to three things that matter most today. Fewer priorities, more follow-through."
          action={
            <ButtonLink href="/today" variant="primary" size="sm">
              Go to Today
            </ButtonLink>
          }
        />
      )}
    </DashboardCard>
  );
}

import type { HabitDayStatus, HabitSummary } from "@levelup/types";
import { describeStreak } from "@levelup/utils";
import { Check, Flame, Repeat } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";

import { DashboardCard } from "./dashboard-card";
import { ViewAllLink } from "./view-all-link";

interface HabitsCardProps {
  habits: readonly HabitSummary[];
  isDemo: boolean;
  className?: string;
}

const dotStyles: Record<HabitDayStatus, string> = {
  done: "bg-primary",
  missed: "bg-warning/45",
  open: "bg-transparent ring-[1.5px] ring-foreground-subtle ring-inset",
  off: "bg-primary/10",
};

/** Seven dots, oldest first; today is the last dot. */
function RecentDays({ days }: { days: readonly HabitDayStatus[] }) {
  const completed = days.filter((status) => status === "done").length;
  return (
    <div
      role="img"
      aria-label={`Done on ${completed} of the last ${days.length} days`}
      className="hidden items-center gap-1.5 sm:flex"
    >
      {days.map((status, index) => (
        <span
          // Position is the identity: the list is a fixed seven-day window.
          key={index}
          className={cn("size-2 rounded-full", dotStyles[status])}
        />
      ))}
    </div>
  );
}

export function HabitsCard({ habits, isDemo, className }: HabitsCardProps) {
  const due = habits.filter((habit) => habit.dueToday);
  const done = due.filter((habit) => habit.completedToday).length;
  const hasHabits = habits.length > 0;

  return (
    <DashboardCard
      id="habits"
      title="Habits"
      description={
        hasHabits ? `${done} of ${due.length} done today` : "Small daily actions that compound"
      }
      isDemo={isDemo}
      action={hasHabits ? <ViewAllLink href="/habits" label="All habits" /> : undefined}
      className={className}
    >
      {hasHabits ? (
        <ul className="-my-1 divide-y divide-border">
          {habits.map((habit) => (
            <li key={habit.id} className="flex items-center gap-3 py-3">
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl",
                  habit.completedToday
                    ? "bg-accent text-accent-foreground"
                    : "bg-surface-muted text-foreground-subtle",
                )}
                aria-hidden="true"
              >
                {habit.completedToday ? (
                  <Check className="size-5" />
                ) : (
                  <Repeat className="size-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-label text-foreground">
                  {habit.name}
                  <span className="sr-only">
                    {habit.completedToday
                      ? " — done today"
                      : habit.dueToday
                        ? " — not done yet today"
                        : " — not due today"}
                  </span>
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-caption text-foreground-muted">
                  <Flame
                    className={cn(
                      "size-3.5",
                      habit.currentStreak > 0 ? "text-warning" : "text-foreground-subtle",
                    )}
                    aria-hidden="true"
                  />
                  {describeStreak(habit)}
                </p>
              </div>
              <RecentDays days={habit.recentDays} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Repeat}
          title="No habits yet"
          description="Start with one habit small enough to do on your worst day. Consistency beats intensity."
          action={
            <ButtonLink href="/habits" variant="primary" size="sm">
              Create a habit
            </ButtonLink>
          }
        />
      )}
    </DashboardCard>
  );
}

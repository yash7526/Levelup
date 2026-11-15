import type { WeeklyActivity } from "@levelup/types";
import { ChartColumn } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";

import { DashboardCard } from "./dashboard-card";
import { WeeklyActivityChart } from "./weekly-activity-chart";

interface WeeklyActivityCardProps {
  activity: WeeklyActivity | null;
  todayCompleted: number;
  isDemo: boolean;
  className?: string;
}

export function WeeklyActivityCard({
  activity,
  todayCompleted,
  isDemo,
  className,
}: WeeklyActivityCardProps) {
  return (
    <DashboardCard
      id="weekly-activity"
      title="Weekly activity"
      description="Priorities and habits completed each day"
      isDemo={isDemo}
      className={className}
    >
      {activity ? (
        <WeeklyActivityChart completions={activity.completions} todayCompleted={todayCompleted} />
      ) : (
        <EmptyState
          icon={ChartColumn}
          title="No activity yet"
          description="Every priority and habit you complete appears here, so you can watch your week take shape."
        />
      )}
    </DashboardCard>
  );
}

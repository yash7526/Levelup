import { summarizeTodayProgress } from "@levelup/utils";
import type { Metadata } from "next";

import { CoachPreviewCard } from "@/components/dashboard/coach-preview-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DemoBanner } from "@/components/dashboard/demo-banner";
import { GoalsCard } from "@/components/dashboard/goals-card";
import { HabitsCard } from "@/components/dashboard/habits-card";
import { LearningCard } from "@/components/dashboard/learning-card";
import { PrioritiesCard } from "@/components/dashboard/priorities-card";
import { TodayProgressCard } from "@/components/dashboard/today-progress-card";
import { WeeklyActivityCard } from "@/components/dashboard/weekly-activity-card";
import { GrowthLoadError } from "@/components/growth/load-error";
import { getDashboardSnapshot } from "@/lib/dashboard/get-dashboard-snapshot";
import { isDemoDataEnabled } from "@/lib/env";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const { demo } = await searchParams;
  const demoEnabled = isDemoDataEnabled();

  const [viewer, { snapshot, loadError }] = await Promise.all([
    getViewer(),
    getDashboardSnapshot({ demo: demoEnabled && demo === "1" }),
  ]);

  const isDemo = snapshot.source === "demo";
  const today = summarizeTodayProgress(snapshot.priorities, snapshot.habits);

  return (
    <div className="grid gap-6 lg:gap-8">
      <DashboardHeader viewer={viewer} isDemo={isDemo} demoEnabled={demoEnabled} />

      {isDemo ? <DemoBanner /> : null}

      {loadError ? (
        <GrowthLoadError message={loadError} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-5">
          <TodayProgressCard
            progress={today}
            isDemo={isDemo}
            className="md:col-span-2 lg:col-span-5"
          />
          <PrioritiesCard
            priorities={snapshot.priorities}
            isDemo={isDemo}
            className="md:col-span-2 lg:col-span-7"
          />
          <HabitsCard
            habits={snapshot.habits}
            isDemo={isDemo}
            className="md:col-span-2 lg:col-span-7"
          />
          <CoachPreviewCard
            insight={snapshot.coachInsight}
            isDemo={isDemo}
            className="md:col-span-2 lg:col-span-5"
          />
          <GoalsCard goals={snapshot.goals} isDemo={isDemo} className="lg:col-span-4" />
          <LearningCard items={snapshot.learning} isDemo={isDemo} className="lg:col-span-4" />
          <WeeklyActivityCard
            activity={snapshot.weeklyActivity}
            todayCompleted={today.overall.completed}
            isDemo={isDemo}
            className="md:col-span-2 lg:col-span-4"
          />
        </div>
      )}
    </div>
  );
}

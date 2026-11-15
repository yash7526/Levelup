import { demoDashboard, emptyDashboard, summarizeTodayProgress } from "@levelup/utils";
import { useState } from "react";

import { CoachPreviewCard } from "@/components/dashboard/coach-preview-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DemoBanner } from "@/components/dashboard/demo-banner";
import { GoalsCard } from "@/components/dashboard/goals-card";
import { HabitsCard } from "@/components/dashboard/habits-card";
import { LearningCard } from "@/components/dashboard/learning-card";
import { PrioritiesCard } from "@/components/dashboard/priorities-card";
import { TodayProgressCard } from "@/components/dashboard/today-progress-card";
import { WeeklyActivityCard } from "@/components/dashboard/weekly-activity-card";
import { Screen } from "@/components/layout/screen";
import { isDemoDataEnabled } from "@/lib/env";
import { useViewer } from "@/providers/viewer";

export default function DashboardScreen() {
  const viewer = useViewer();
  const demoEnabled = isDemoDataEnabled();
  const [showSample, setShowSample] = useState(false);

  // Live module data arrives with each module's milestone. Until then the live
  // dashboard is honestly empty; sample data only on explicit request, always labelled.
  const snapshot = demoEnabled && showSample ? demoDashboard : emptyDashboard;
  const isDemo = snapshot.source === "demo";
  const today = summarizeTodayProgress(snapshot.priorities, snapshot.habits);

  return (
    <Screen kind="tab">
      <DashboardHeader
        viewer={viewer}
        isDemo={isDemo}
        demoEnabled={demoEnabled}
        onShowSample={() => setShowSample(true)}
      />
      {isDemo ? <DemoBanner onExit={() => setShowSample(false)} /> : null}
      <TodayProgressCard progress={today} isDemo={isDemo} />
      <PrioritiesCard priorities={snapshot.priorities} isDemo={isDemo} />
      <HabitsCard habits={snapshot.habits} isDemo={isDemo} />
      <CoachPreviewCard insight={snapshot.coachInsight} isDemo={isDemo} />
      <GoalsCard goals={snapshot.goals} isDemo={isDemo} />
      <LearningCard items={snapshot.learning} isDemo={isDemo} />
      <WeeklyActivityCard
        activity={snapshot.weeklyActivity}
        todayCompleted={today.overall.completed}
        isDemo={isDemo}
      />
    </Screen>
  );
}

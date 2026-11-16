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
import { ActionError } from "@/components/growth/action-error";
import { Screen } from "@/components/layout/screen";
import { isDemoDataEnabled } from "@/lib/env";
import { useGrowth } from "@/providers/growth";
import { useViewer } from "@/providers/viewer";

export default function DashboardScreen() {
  const viewer = useViewer();
  const growth = useGrowth();
  const demoEnabled = isDemoDataEnabled();
  const [showSample, setShowSample] = useState(false);

  // Priorities, habits and weekly activity are live; goals, learning and the coach stay
  // empty until their modules exist. Sample data only on explicit request, always labelled.
  const live = growth.snapshot ?? emptyDashboard;
  const snapshot = demoEnabled && showSample ? demoDashboard : live;
  const isDemo = snapshot.source === "demo";
  const today = summarizeTodayProgress(snapshot.priorities, snapshot.habits);

  return (
    <Screen kind="tab" onRefresh={() => void growth.refresh()} refreshing={growth.refreshing}>
      <DashboardHeader
        viewer={viewer}
        isDemo={isDemo}
        demoEnabled={demoEnabled}
        onShowSample={() => setShowSample(true)}
      />
      {isDemo ? <DemoBanner onExit={() => setShowSample(false)} /> : null}
      {!isDemo && growth.loadError ? (
        <ActionError message={growth.loadError} onDismiss={() => undefined} />
      ) : null}
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

import {
  buildDashboardSnapshot,
  demoDashboard,
  emptyDashboard,
  summarizeTodayProgress,
} from "@levelup/utils";
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
import { usePlanning } from "@/providers/planning";
import { useViewer } from "@/providers/viewer";

export default function DashboardScreen() {
  const viewer = useViewer();
  const growth = useGrowth();
  const planning = usePlanning();
  const demoEnabled = isDemoDataEnabled();
  const [showSample, setShowSample] = useState(false);

  // Everything is live, including the coach's top insight. Sample data only on explicit
  // request, always labelled.
  const live = growth.data
    ? buildDashboardSnapshot(growth.data, growth.toLocalDay, planning.data)
    : emptyDashboard;
  const snapshot = demoEnabled && showSample ? demoDashboard : live;
  const isDemo = snapshot.source === "demo";
  const today = summarizeTodayProgress(snapshot.priorities, snapshot.habits);

  return (
    <Screen
      kind="tab"
      onRefresh={() => void Promise.all([growth.refresh(), planning.refresh()])}
      refreshing={growth.refreshing || planning.refreshing}
    >
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
      {!isDemo && !growth.loadError && planning.loadError ? (
        <ActionError
          message={`${planning.loadError} The goals and learning cards are empty only because of this.`}
          onDismiss={() => undefined}
        />
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

import { buildCoachReport } from "@levelup/utils";
import { Sparkles } from "lucide-react";
import type { Metadata } from "next";

import { CoachView } from "@/components/coach/coach-view";
import { AccountRequired } from "@/components/growth/account-required";
import { GrowthLoadError } from "@/components/growth/load-error";
import { PageHeader } from "@/components/layout/page-header";
import { getGrowthContext, getGrowthData, getPlanningData } from "@/lib/growth/context";

export const metadata: Metadata = { title: "AI Coach" };

const description = "Guidance grounded in your own habits, goals, learning and priorities.";

export default async function CoachPage() {
  const context = await getGrowthContext();
  if (!context) {
    return <AccountRequired icon={Sparkles} title="AI Coach" description={description} />;
  }

  const [growth, planning] = await Promise.all([getGrowthData(context), getPlanningData(context)]);
  if (!growth.ok) {
    return (
      <div className="grid gap-6 lg:gap-8">
        <PageHeader title="AI Coach" description={description} />
        <GrowthLoadError message={growth.message} />
      </div>
    );
  }

  const report = buildCoachReport(
    growth.data,
    planning.ok ? planning.data : null,
    context.toLocalDay,
  );
  return <CoachView report={report} planningError={planning.ok ? null : planning.message} />;
}

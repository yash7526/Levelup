import { Target } from "lucide-react";
import type { Metadata } from "next";

import { AccountRequired } from "@/components/growth/account-required";
import { GrowthLoadError } from "@/components/growth/load-error";
import { GoalsBoard } from "@/components/goals/goals-board";
import { PageHeader } from "@/components/layout/page-header";
import { getGrowthContext, getPlanningData } from "@/lib/growth/context";

export const metadata: Metadata = { title: "Goals" };

const description = "Turn long-term ambitions into milestones you can actually see yourself reach.";

export default async function GoalsPage() {
  const context = await getGrowthContext();
  if (!context) {
    return <AccountRequired icon={Target} title="Goals" description={description} />;
  }

  const load = await getPlanningData(context);
  if (!load.ok) {
    return (
      <div className="grid gap-6 lg:gap-8">
        <PageHeader title="Goals" description={description} />
        <GrowthLoadError message={load.message} />
      </div>
    );
  }

  return <GoalsBoard today={context.today} goals={load.data.goals} />;
}

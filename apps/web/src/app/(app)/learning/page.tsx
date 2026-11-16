import { BookOpen } from "lucide-react";
import type { Metadata } from "next";

import { AccountRequired } from "@/components/growth/account-required";
import { GrowthLoadError } from "@/components/growth/load-error";
import { PageHeader } from "@/components/layout/page-header";
import { LearningBoard } from "@/components/learning/learning-board";
import { getGrowthContext, getPlanningData } from "@/lib/growth/context";

export const metadata: Metadata = { title: "Learning" };

const description = "Keep the courses, books and skills you're working through moving forward.";

export default async function LearningPage() {
  const context = await getGrowthContext();
  if (!context) {
    return <AccountRequired icon={BookOpen} title="Learning" description={description} />;
  }

  const load = await getPlanningData(context);
  if (!load.ok) {
    return (
      <div className="grid gap-6 lg:gap-8">
        <PageHeader title="Learning" description={description} />
        <GrowthLoadError message={load.message} />
      </div>
    );
  }

  return (
    <LearningBoard today={context.today} items={load.data.learning} sessions={load.data.sessions} />
  );
}

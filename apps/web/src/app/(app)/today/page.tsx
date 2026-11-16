import { APP_LOCALE, formatISODate, prioritiesForDay, summarizeActiveHabits } from "@levelup/utils";
import { ListChecks } from "lucide-react";
import type { Metadata } from "next";

import { AccountRequired } from "@/components/growth/account-required";
import { GrowthLoadError } from "@/components/growth/load-error";
import { PageHeader } from "@/components/layout/page-header";
import { TodayPlanner } from "@/components/today/today-planner";
import { getGrowthContext, getGrowthData } from "@/lib/growth/context";

export const metadata: Metadata = { title: "Today" };

const description = "Pick up to three priorities, then keep your habits moving.";

export default async function TodayPage() {
  const context = await getGrowthContext();
  if (!context) {
    return <AccountRequired icon={ListChecks} title="Today" description={description} />;
  }

  const load = await getGrowthData(context);

  return (
    <div className="grid gap-6 lg:gap-8">
      <PageHeader
        eyebrow={formatISODate(context.today, APP_LOCALE, {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
        title="Today"
        description={description}
      />
      {load.ok ? (
        <TodayPlanner
          today={context.today}
          priorities={prioritiesForDay(load.data.priorities, context.today)}
          carryOver={load.data.carryOver}
          habits={summarizeActiveHabits(load.data, context.toLocalDay)}
        />
      ) : (
        <GrowthLoadError message={load.message} />
      )}
    </div>
  );
}

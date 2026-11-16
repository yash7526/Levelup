import { HABIT_HISTORY_DAYS, lastDays, summarizeHabits } from "@levelup/utils";
import { Repeat } from "lucide-react";
import type { Metadata } from "next";

import { AccountRequired } from "@/components/growth/account-required";
import { GrowthLoadError } from "@/components/growth/load-error";
import { PageHeader } from "@/components/layout/page-header";
import { type HabitModel, HabitsBoard } from "@/components/habits/habits-board";
import { getGrowthContext, getGrowthData } from "@/lib/growth/context";

export const metadata: Metadata = { title: "Habits" };

const description = "Small, repeatable actions that compound into who you become.";

export default async function HabitsPage() {
  const context = await getGrowthContext();
  if (!context) {
    return <AccountRequired icon={Repeat} title="Habits" description={description} />;
  }

  const load = await getGrowthData(context);
  if (!load.ok) {
    return (
      <div className="grid gap-6 lg:gap-8">
        <PageHeader title="Habits" description={description} />
        <GrowthLoadError message={load.message} />
      </div>
    );
  }

  const { data } = load;
  const activeHabits = data.habits.filter((habit) => habit.archivedAt === null);
  const summaries = summarizeHabits(activeHabits, data.checkins, context.today, context.toLocalDay);
  const active: HabitModel[] = activeHabits.flatMap((habit, index) => {
    const summary = summaries[index];
    return summary ? [{ habit, summary, start: context.toLocalDay(habit.createdAt) }] : [];
  });

  return (
    <HabitsBoard
      today={context.today}
      days={lastDays(context.today, HABIT_HISTORY_DAYS)}
      active={active}
      archived={data.habits.filter((habit) => habit.archivedAt !== null)}
    />
  );
}

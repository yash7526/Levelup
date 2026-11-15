import type { LearningItemSummary, LearningKind } from "@levelup/types";
import {
  BookOpen,
  CirclePlay,
  FileText,
  GraduationCap,
  type LucideIcon,
  Sparkle,
} from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress";

import { DashboardCard } from "./dashboard-card";
import { ViewAllLink } from "./view-all-link";

const kindMeta: Record<LearningKind, { label: string; icon: LucideIcon }> = {
  course: { label: "Course", icon: CirclePlay },
  book: { label: "Book", icon: BookOpen },
  skill: { label: "Skill", icon: Sparkle },
  article: { label: "Article", icon: FileText },
};

interface LearningCardProps {
  items: readonly LearningItemSummary[];
  isDemo: boolean;
  className?: string;
}

export function LearningCard({ items, isDemo, className }: LearningCardProps) {
  const hasItems = items.length > 0;

  return (
    <DashboardCard
      id="learning"
      title="Learning"
      description={hasItems ? `${items.length} in progress` : "Courses, books and skills"}
      isDemo={isDemo}
      action={hasItems ? <ViewAllLink href="/learning" label="Library" /> : undefined}
      className={className}
    >
      {hasItems ? (
        <ul className="grid gap-4">
          {items.map((item) => {
            const { label, icon: Icon } = kindMeta[item.kind];
            const { completed, total } = item.progress;
            return (
              <li key={item.id} className="flex items-center gap-3">
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-muted text-foreground-muted"
                  aria-hidden="true"
                >
                  <Icon className="size-[1.125rem]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-label text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-caption text-foreground-muted">
                    {label} · {completed} of {total} {item.unit}
                  </p>
                  <ProgressBar
                    value={completed}
                    max={total}
                    size="sm"
                    label={`${item.title} progress`}
                    valueText={`${completed} of ${total} ${item.unit}`}
                    className="mt-2"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={GraduationCap}
          title="Nothing in progress"
          description="Track the courses, books and skills you're working through, one session at a time."
          action={
            <ButtonLink href="/learning" variant="primary" size="sm">
              Explore Learning
            </ButtonLink>
          }
        />
      )}
    </DashboardCard>
  );
}

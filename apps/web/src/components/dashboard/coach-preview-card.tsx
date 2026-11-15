import type { CoachInsight } from "@levelup/types";
import { coachCapabilities as capabilities } from "@levelup/utils";
import { ArrowRight, Lightbulb, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

import { DashboardCard } from "./dashboard-card";

interface CoachPreviewCardProps {
  insight: CoachInsight | null;
  isDemo: boolean;
  className?: string;
}

export function CoachPreviewCard({ insight, isDemo, className }: CoachPreviewCardProps) {
  return (
    <DashboardCard
      id="coach"
      title="AI Coach"
      description="Personal guidance, grounded in your progress"
      isDemo={isDemo}
      action={isDemo ? undefined : <Badge variant="accent">Coming soon</Badge>}
      className={className}
    >
      <div className="flex flex-1 flex-col gap-4">
        {insight ? (
          <figure className="relative rounded-2xl bg-surface-muted p-4">
            <div className="flex items-center gap-2">
              <span
                className="grid size-7 place-items-center rounded-full bg-accent text-accent-foreground"
                aria-hidden="true"
              >
                <Sparkles className="size-3.5" />
              </span>
              <figcaption className="text-caption text-foreground-muted">Coach insight</figcaption>
            </div>
            <blockquote className="mt-3 text-body text-pretty text-foreground">
              {insight.message}
            </blockquote>
            {insight.suggestion ? (
              <p className="mt-3 flex gap-2 rounded-xl bg-surface p-3 text-body-sm text-foreground">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                <span>
                  <span className="font-semibold">Next step: </span>
                  {insight.suggestion}
                </span>
              </p>
            ) : null}
          </figure>
        ) : (
          <ul className="grid gap-2.5">
            {capabilities.map((capability) => (
              <li key={capability} className="flex gap-2.5 text-body-sm text-foreground-muted">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {capability}
              </li>
            ))}
          </ul>
        )}
        <ButtonLink href="/coach" variant="outline" size="sm" className="mt-auto self-start">
          Meet your coach
          <ArrowRight aria-hidden="true" />
        </ButtonLink>
      </div>
    </DashboardCard>
  );
}

import { ArrowLeft, Check, type LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

interface ModulePreviewProps {
  icon: LucideIcon;
  title: string;
  tagline: string;
  /** What this module will let people do. */
  plannedCapabilities: readonly string[];
  /** How the dashboard will reflect this module once it ships. */
  dashboardNote: string;
}

/**
 * Landing page for a module that is planned but not yet built. It is honest about
 * status and always offers a real way back, so navigation never dead-ends.
 */
export function ModulePreview({
  icon: Icon,
  title,
  tagline,
  plannedCapabilities,
  dashboardNote,
}: ModulePreviewProps) {
  return (
    <div className="grid gap-6 lg:gap-8">
      <PageHeader
        title={title}
        description={tagline}
        actions={<Badge variant="accent">In development</Badge>}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-5">
        <Card as="section" aria-labelledby="module-status-title" className="flex flex-col gap-5">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand text-accent">
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <div>
            <CardTitle id="module-status-title" className="text-heading-2">
              {title} is on its way
            </CardTitle>
            <CardDescription className="mt-2 max-w-prose text-body">
              This part of LevelUp is being built in an upcoming milestone. Nothing here is tracked
              yet. {dashboardNote}
            </CardDescription>
          </div>
          <ButtonLink href="/dashboard" variant="outline" className="self-start">
            <ArrowLeft aria-hidden="true" />
            Back to dashboard
          </ButtonLink>
        </Card>

        <Card as="section" aria-labelledby="module-plan-title" variant="muted">
          <h2 id="module-plan-title" className="text-overline text-foreground-muted uppercase">
            Planned
          </h2>
          <ul className="mt-4 grid gap-3">
            {plannedCapabilities.map((capability) => (
              <li key={capability} className="flex gap-3 text-body text-foreground">
                <span
                  className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/12 text-primary"
                  aria-hidden="true"
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {capability}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

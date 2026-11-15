import type { Viewer } from "@levelup/types";
import { FlaskConical } from "lucide-react";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";

import { Greeting } from "./greeting";

interface DashboardHeaderProps {
  viewer: Viewer;
  isDemo: boolean;
  demoEnabled: boolean;
}

export function DashboardHeader({ viewer, isDemo, demoEnabled }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <Greeting displayName={viewer.displayName} />
        <p className="mt-2 max-w-xl text-body-lg text-pretty text-foreground-muted">
          {viewer.displayName ? (
            "Here's where today stands."
          ) : (
            <>
              Small steps, every day.{" "}
              <Link
                href="/settings#profile"
                className="font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-foreground"
              >
                Add your name
              </Link>{" "}
              to personalise LevelUp.
            </>
          )}
        </p>
      </div>
      {demoEnabled && !isDemo ? (
        <ButtonLink
          href="/dashboard?demo=1"
          variant="outline"
          size="sm"
          className="self-start sm:self-auto"
        >
          <FlaskConical aria-hidden="true" />
          Preview with sample data
        </ButtonLink>
      ) : null}
    </header>
  );
}

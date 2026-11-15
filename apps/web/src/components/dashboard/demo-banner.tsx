import { FlaskConical } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";

/** Shown whenever the dashboard renders sample data. */
export function DemoBanner() {
  return (
    <aside
      aria-label="Sample data notice"
      className="flex flex-col gap-4 rounded-2xl border border-dashed border-warning/50 bg-warning-subtle p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div className="flex gap-3">
        <FlaskConical className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
        <div>
          <p className="text-label font-semibold text-foreground">
            You&apos;re viewing sample data
          </p>
          <p className="mt-0.5 text-body-sm text-foreground-muted">
            Everything below is illustrative and not connected to your account. It exists to preview
            the dashboard design.
          </p>
        </div>
      </div>
      <ButtonLink href="/dashboard" variant="outline" size="sm" className="self-start sm:self-auto">
        Exit preview
      </ButtonLink>
    </aside>
  );
}

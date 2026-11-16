import { TriangleAlert } from "lucide-react";

/** Explains that the Goals and Learning cards are empty because they couldn't be loaded. */
export function PlanningNotice({ message }: { message: string }) {
  return (
    <aside
      aria-label="Goals and learning unavailable"
      className="flex gap-3 rounded-2xl border border-dashed border-warning/50 bg-warning-subtle p-4 sm:p-5"
    >
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
      <div>
        <p className="text-label font-semibold text-foreground">
          Goals and learning couldn&apos;t be loaded
        </p>
        <p className="mt-0.5 text-body-sm text-foreground-muted">
          {message} Those two cards are empty only because of this, not because you have nothing
          there.
        </p>
      </div>
    </aside>
  );
}

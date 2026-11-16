import { CircleAlert, X } from "lucide-react";

import { Button } from "@/components/ui/button";

/** An inline, dismissible error for a failed save. Announced to screen readers. */
export function ActionError({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  return (
    <div role="alert" aria-live="assertive">
      {message ? (
        <div className="flex items-start gap-3 rounded-xl bg-danger-subtle px-4 py-3 text-body-sm text-danger">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p className="min-w-0 flex-1">{message}</p>
          <Button
            variant="ghost"
            size="icon-sm"
            className="-my-1.5 -mr-2 text-danger hover:bg-danger/10"
            aria-label="Dismiss"
            onClick={onDismiss}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

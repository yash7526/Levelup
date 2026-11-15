import { CircleAlert, CircleCheck } from "lucide-react";

/** Form-level error or confirmation, announced to screen readers when it appears. */
export function FormMessage({ error, notice }: { error?: string; notice?: string }) {
  if (error) {
    return (
      <p
        role="alert"
        className="flex gap-2 rounded-xl bg-danger-subtle px-3.5 py-3 text-body-sm text-danger"
      >
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {error}
      </p>
    );
  }
  if (notice) {
    return (
      <p
        role="status"
        className="flex gap-2 rounded-xl bg-success-subtle px-3.5 py-3 text-body-sm text-success"
      >
        <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {notice}
      </p>
    );
  }
  return null;
}

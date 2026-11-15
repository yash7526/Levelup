import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  /** A single, real next step — usually a link to the relevant module. */
  action?: ReactNode;
  align?: "center" | "start";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  align = "center",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col justify-center gap-3 py-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <span className="grid size-11 place-items-center rounded-xl bg-surface-muted text-foreground-muted">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="grid max-w-sm gap-1">
        <p className="font-display text-heading-3 text-foreground">{title}</p>
        <p className="text-body-sm text-foreground-muted">{description}</p>
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-2 text-overline text-foreground-muted uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-heading-1 text-balance text-foreground sm:text-display">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-body-lg text-pretty text-foreground-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

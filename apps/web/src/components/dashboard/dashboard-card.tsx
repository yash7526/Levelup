import type { ReactNode } from "react";

import { SampleBadge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  type CardVariant,
} from "@/components/ui/card";
import { cn } from "@/lib/cn";

interface DashboardCardProps {
  id: string;
  title: string;
  description?: ReactNode;
  /** Header-level action, e.g. a "View all" link. */
  action?: ReactNode;
  isDemo?: boolean;
  variant?: CardVariant;
  className?: string;
  children: ReactNode;
}

/** Consistent frame for dashboard sections: titled landmark, optional sample label. */
export function DashboardCard({
  id,
  title,
  description,
  action,
  isDemo = false,
  variant,
  className,
  children,
}: DashboardCardProps) {
  const titleId = `${id}-title`;
  return (
    <Card
      as="section"
      aria-labelledby={titleId}
      variant={variant}
      className={cn("flex min-w-0 flex-col", className)}
    >
      <CardHeader>
        <div className="min-w-0">
          <CardTitle id={titleId}>{title}</CardTitle>
          {description ? (
            <CardDescription className={variant === "brand" ? "text-brand-muted" : undefined}>
              {description}
            </CardDescription>
          ) : null}
        </div>
        {isDemo || action ? (
          <div className="flex shrink-0 items-center gap-2">
            {isDemo ? <SampleBadge /> : null}
            {action}
          </div>
        ) : null}
      </CardHeader>
      <div className="flex flex-1 flex-col">{children}</div>
    </Card>
  );
}

import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type BadgeVariant =
  "neutral" | "primary" | "accent" | "success" | "warning" | "danger" | "outline" | "sample";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-surface-muted text-foreground-muted",
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-danger-subtle text-danger",
  outline: "border border-border-strong text-foreground-muted",
  // Marks illustrative data. Dashed edge reads as "placeholder" at a glance.
  sample: "border border-dashed border-warning/60 bg-warning-subtle text-warning",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2.5 text-caption whitespace-nowrap [&_svg]:size-3.5",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

/** Standard label for any surface rendering sample data. */
export function SampleBadge({ className }: { className?: string }) {
  return (
    <Badge variant="sample" className={className} title="Illustrative sample data, not yours">
      Sample
    </Badge>
  );
}

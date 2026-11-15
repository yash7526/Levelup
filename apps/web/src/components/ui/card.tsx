import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type CardVariant = "default" | "muted" | "brand" | "outline";

const variants: Record<CardVariant, string> = {
  default: "border border-border/70 bg-surface shadow-card",
  muted: "bg-surface-muted",
  brand: "bg-brand text-brand-foreground shadow-raised",
  outline: "border border-border",
};

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article" | "aside";
  variant?: CardVariant;
}

export function Card({
  as: Component = "div",
  variant = "default",
  className,
  ...props
}: CardProps) {
  return (
    <Component className={cn("rounded-2xl p-5 sm:p-6", variants[variant], className)} {...props} />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-5 flex items-start justify-between gap-3", className)} {...props} />
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h2" | "h3";
}

export function CardTitle({ as: Heading = "h2", className, ...props }: CardTitleProps) {
  return <Heading className={cn("font-display text-heading-3", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-0.5 text-body-sm text-foreground-muted", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-5 flex items-center gap-3", className)} {...props} />;
}

import { LoaderCircle } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "accent" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon-sm" | "icon";

const base = cn(
  "relative inline-flex shrink-0 items-center justify-center rounded-full font-medium whitespace-nowrap select-none",
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-standard",
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
);

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground shadow-card hover:bg-primary-hover",
  secondary: "bg-surface-muted text-foreground hover:bg-surface-hover",
  outline: "border border-border-strong bg-surface text-foreground hover:bg-surface-muted",
  ghost: "text-foreground hover:bg-surface-muted",
  accent: "bg-accent text-accent-foreground hover:bg-accent-hover",
  danger: "bg-danger text-danger-foreground hover:bg-danger/90",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 px-3.5 text-body-sm font-medium",
  md: "h-11 gap-2 px-5 text-label",
  lg: "h-12 gap-2 px-6 text-body font-semibold",
  "icon-sm": "size-9",
  icon: "size-11",
};

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: ButtonStyleOptions = {}): string {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, disables the button and sets `aria-busy`. */
  loading?: boolean;
}

export function Button({
  variant,
  size,
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export interface ButtonLinkProps<T extends string> extends Omit<ComponentProps<"a">, "href"> {
  href: Route<T>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  prefetch?: boolean;
}

/** A navigation link styled as a button. Use for anything that changes the URL. */
export function ButtonLink<T extends string>({
  href,
  variant,
  size,
  className,
  ...props
}: ButtonLinkProps<T>) {
  return <Link href={href} className={buttonStyles({ variant, size, className })} {...props} />;
}

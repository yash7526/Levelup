import { Check } from "lucide-react";

import { cn } from "@/lib/cn";

interface CheckToggleProps {
  checked: boolean;
  /** Accessible name, e.g. `Morning pages`. The checked state is announced separately. */
  label: string;
  onToggle: () => void;
  disabled?: boolean;
  size?: "md" | "lg";
  className?: string;
}

/** A round tick button with checkbox semantics, for priorities and habits. */
export function CheckToggle({
  checked,
  label,
  onToggle,
  disabled,
  size = "md",
  className,
}: CheckToggleProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "grid shrink-0 place-items-center rounded-full border-2 transition-[background-color,border-color,transform] duration-150 ease-standard",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        "active:scale-95 disabled:pointer-events-none disabled:opacity-50",
        size === "lg" ? "size-11" : "size-8",
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border-strong bg-surface text-transparent hover:border-primary hover:text-primary/40",
        className,
      )}
    >
      <Check className={size === "lg" ? "size-5" : "size-4"} strokeWidth={3} aria-hidden="true" />
    </button>
  );
}

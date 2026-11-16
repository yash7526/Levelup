import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

interface SelectProps extends ComponentProps<"select"> {
  invalid?: boolean;
}

/** Native select styled like `Input`, so it keeps the platform's accessible picker. */
export function Select({ className, invalid, children, ...props }: SelectProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        aria-invalid={invalid || undefined}
        className={cn(
          "h-11 w-full min-w-0 appearance-none rounded-xl border border-border-strong bg-surface pr-10 pl-3.5 text-body text-foreground",
          "transition-[border-color,box-shadow] duration-150 outline-none",
          "hover:border-foreground-subtle focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15",
          "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60",
          "aria-invalid:border-danger",
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-foreground-muted"
        aria-hidden="true"
      />
    </div>
  );
}

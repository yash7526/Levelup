import { CircleAlert } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

interface InputProps extends ComponentProps<"input"> {
  invalid?: boolean;
}

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-border-strong bg-surface px-3.5 text-body text-foreground",
        "transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-foreground-subtle",
        "hover:border-foreground-subtle focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15",
        "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60",
        "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/15",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-label text-foreground", className)} {...props} />;
}

interface TextFieldProps extends Omit<InputProps, "id" | "invalid"> {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  inputClassName?: string;
}

/** Label + input + hint + error, wired together with `aria-describedby`. */
export function TextField({
  id,
  label,
  hint,
  error,
  className,
  inputClassName,
  ...inputProps
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-describedby={describedBy}
        invalid={Boolean(error)}
        className={inputClassName}
        {...inputProps}
      />
      {hint ? (
        <p id={hintId} className="text-body-sm text-foreground-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="flex items-center gap-1.5 text-body-sm text-danger">
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";

import { cn } from "@/lib/cn";

import { Button } from "./button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  /** Action row, e.g. Cancel / Confirm buttons. */
  footer?: ReactNode;
  /** `sheet` slides up from the bottom on small screens and centres on larger ones. */
  variant?: "dialog" | "sheet";
  size?: "sm" | "md" | "lg";
  /** Visually hide the title (it stays the dialog's accessible name). */
  hideTitle?: boolean;
}

const widths = { sm: "sm:max-w-sm", md: "sm:max-w-md", lg: "sm:max-w-xl" } as const;

/**
 * Accessible modal built on the native `<dialog>` element: focus trapping, Escape to
 * close, inert background and top-layer stacking come from the platform.
 * Clicking the backdrop also closes it.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  variant = "dialog",
  size = "md",
  hideTitle = false,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Sync the `open` prop with the imperative dialog API.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Native events: `close` fires for Escape and programmatic closes; a click whose
  // target is the <dialog> itself landed on the backdrop.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    const handleClick = (event: MouseEvent) => {
      if (event.target === dialog) dialog.close();
    };
    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("click", handleClick);
    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("click", handleClick);
    };
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      data-variant={variant}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn("lu-dialog", widths[size])}
    >
      <div
        className={cn(
          "relative max-h-[inherit] overflow-y-auto bg-surface text-foreground shadow-floating",
          variant === "sheet"
            ? "rounded-t-3xl px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-3xl sm:p-6"
            : "rounded-3xl p-6",
        )}
      >
        {variant === "sheet" ? (
          <div
            className="mx-auto mb-3 h-1 w-10 rounded-full bg-border-strong sm:hidden"
            aria-hidden="true"
          />
        ) : null}
        <div className="flex items-start justify-between gap-4">
          <div className={cn("min-w-0", hideTitle && "sr-only")}>
            <h2 id={titleId} className="font-display text-heading-2">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-body-sm text-foreground-muted">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="-mt-1 -mr-2 ml-auto"
            aria-label="Close"
            onClick={() => ref.current?.close()}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
        {children ? <div className="mt-5">{children}</div> : null}
        {footer ? (
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {footer}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}

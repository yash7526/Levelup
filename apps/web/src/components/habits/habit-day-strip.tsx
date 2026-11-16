import type { HabitDayStatus, ISODateString } from "@levelup/types";
import { APP_LOCALE, formatISODate } from "@levelup/utils";
import { Check } from "lucide-react";

import { cn } from "@/lib/cn";

const statusWords: Record<HabitDayStatus, string> = {
  done: "done",
  missed: "missed",
  open: "not done yet",
  off: "not scheduled",
};

const statusStyles: Record<HabitDayStatus, string> = {
  done: "border-primary bg-primary text-primary-foreground",
  open: "border-2 border-primary bg-surface text-foreground",
  missed: "border-transparent bg-warning-subtle text-warning",
  off: "border-dashed border-border-strong text-foreground-subtle",
};

interface HabitDayStripProps {
  /** The days shown, oldest first; the last is today. */
  days: readonly ISODateString[];
  statuses: readonly HabitDayStatus[];
  /** Days before this can't be changed (the habit didn't exist yet). */
  start: ISODateString;
  /** Toggles a day; omit for a read-only strip. */
  onToggle?: (day: ISODateString, done: boolean) => void;
  className?: string;
}

/** The last seven days of a habit. Each day can be ticked or unticked. */
export function HabitDayStrip({ days, statuses, start, onToggle, className }: HabitDayStripProps) {
  return (
    <ol className={cn("grid grid-cols-7 gap-1.5", className)}>
      {days.map((day, index) => {
        const status = statuses[index] ?? "off";
        const done = status === "done";
        const isToday = index === days.length - 1;
        const label = `${formatISODate(day, APP_LOCALE, { weekday: "long", day: "numeric", month: "long" })}${isToday ? " (today)" : ""}: ${statusWords[status]}`;
        const content = (
          <>
            <span
              className={cn(
                "text-caption",
                isToday ? "font-semibold text-foreground" : "text-foreground-muted",
              )}
              aria-hidden="true"
            >
              {formatISODate(day, APP_LOCALE, { weekday: "narrow" })}
            </span>
            <span
              className={cn(
                "grid size-9 place-items-center rounded-full border text-body-sm font-medium tabular-nums transition-colors duration-150",
                statusStyles[status],
              )}
              aria-hidden="true"
            >
              {done ? <Check className="size-4" strokeWidth={3} /> : Number(day.slice(8))}
            </span>
          </>
        );
        return (
          <li key={day} className="flex justify-center">
            {onToggle ? (
              <button
                type="button"
                aria-pressed={done}
                aria-label={label}
                title={label}
                disabled={day < start}
                onClick={() => onToggle(day, !done)}
                className="flex flex-col items-center gap-1 rounded-xl p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
              >
                {content}
              </button>
            ) : (
              <span className="flex flex-col items-center gap-1" role="img" aria-label={label}>
                {content}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Explains the strip's colours once per page. */
export function HabitDayLegend({ className }: { className?: string }) {
  const items: { status: HabitDayStatus; label: string }[] = [
    { status: "done", label: "Done" },
    { status: "open", label: "Due today" },
    { status: "missed", label: "Missed" },
    { status: "off", label: "Not scheduled" },
  ];
  return (
    <ul
      className={cn("flex flex-wrap gap-x-4 gap-y-2 text-caption text-foreground-muted", className)}
    >
      {items.map(({ status, label }) => (
        <li key={status} className="flex items-center gap-1.5">
          <span
            className={cn("size-3 rounded-full border", statusStyles[status])}
            aria-hidden="true"
          />
          {label}
        </li>
      ))}
    </ul>
  );
}

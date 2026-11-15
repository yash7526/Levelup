"use client";

import { getWeekdayIndex, getWeekdayLabels, pluralize, sum } from "@levelup/utils";

import { cn } from "@/lib/cn";
import { useCurrentTime } from "@/lib/hooks/use-current-time";
import { APP_LOCALE } from "@/lib/locale";

type DayStatus = "past" | "today" | "upcoming" | "unknown";

interface Day {
  short: string;
  long: string;
  status: DayStatus;
  /** `null` when there is no value to show (upcoming, or before hydration). */
  value: number | null;
}

const shortLabels = getWeekdayLabels(APP_LOCALE, "short");
const longLabels = getWeekdayLabels(APP_LOCALE, "long");

/** Rounds the axis up to an even number with a small floor so tiny weeks don't look huge. */
function niceMax(value: number): number {
  return Math.max(4, Math.ceil(value / 2) * 2);
}

interface WeeklyActivityChartProps {
  /** Seven values, Monday first. */
  completions: readonly number[];
  /** Today's live count; overrides the stored value for today. */
  todayCompleted: number;
}

/**
 * Single-series column chart for the current week. The week position depends on the
 * viewer's local date, so bars render after hydration; weekday labels render on the server.
 */
export function WeeklyActivityChart({ completions, todayCompleted }: WeeklyActivityChartProps) {
  const now = useCurrentTime();
  const todayIndex = now ? getWeekdayIndex(now) : null;

  const days: Day[] = shortLabels.map((short, index) => {
    const status: DayStatus =
      todayIndex === null
        ? "unknown"
        : index < todayIndex
          ? "past"
          : index === todayIndex
            ? "today"
            : "upcoming";
    const value =
      status === "today" ? todayCompleted : status === "past" ? (completions[index] ?? 0) : null;
    return { short, long: longLabels[index] ?? short, status, value };
  });

  const known = days.flatMap((day) => (day.value === null ? [] : [day.value]));
  const total = sum(known);
  const scaleMax = niceMax(Math.max(0, ...known));
  const best = days.reduce<Day | null>(
    (top, day) => (day.value !== null && day.value > (top?.value ?? 0) ? day : top),
    null,
  );

  return (
    <figure className="flex flex-1 flex-col">
      <div className="flex gap-2" aria-hidden="true">
        {/* Y axis */}
        <div className="flex h-36 w-5 flex-col justify-between text-right text-caption text-foreground-subtle tabular-nums">
          <span className="-translate-y-1/2">{scaleMax}</span>
          <span>{scaleMax / 2}</span>
          <span className="translate-y-1/2">0</span>
        </div>

        {/* Plot */}
        <div className="relative h-36 flex-1">
          <div className="absolute inset-x-0 top-0 border-t border-border" />
          <div className="absolute inset-x-0 top-1/2 border-t border-border" />
          <div className="absolute inset-x-0 bottom-0 border-t border-border-strong" />

          <ol className="absolute inset-0 grid grid-cols-7 gap-1.5 sm:gap-2">
            {days.map((day) => {
              const height = day.value ? (day.value / scaleMax) * 100 : 0;
              const isToday = day.status === "today";
              return (
                <li key={day.long} className="group relative flex items-end justify-center">
                  {height > 0 ? (
                    <span
                      className={cn(
                        "w-full max-w-6 origin-bottom rounded-t-[4px] transition-[transform,opacity] duration-500 ease-emphasized starting:scale-y-0",
                        "group-hover:opacity-80",
                        isToday ? "bg-primary" : "bg-forest-400 dark:bg-forest-300",
                      )}
                      style={{ height: `${height}%` }}
                    />
                  ) : null}

                  {/* Direct label on today's cap only; other values live in the tooltip and table. */}
                  {isToday ? (
                    <span
                      className="absolute left-1/2 -translate-x-1/2 text-caption font-semibold text-foreground"
                      style={{ bottom: `calc(${height}% + 4px)` }}
                    >
                      {day.value}
                    </span>
                  ) : null}

                  {day.status === "past" ? (
                    <span
                      className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 rounded-lg bg-foreground px-2 py-1 text-center whitespace-nowrap text-background opacity-0 shadow-raised transition-opacity duration-150 group-hover:opacity-100"
                      style={{ bottom: `calc(${height}% + 6px)` }}
                    >
                      <span className="block text-label font-semibold">{day.value}</span>
                      <span className="block text-caption opacity-75">{day.short}</span>
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* X axis */}
      <ol className="mt-2 ml-7 grid grid-cols-7 gap-1.5 sm:gap-2" aria-hidden="true">
        {days.map((day) => (
          <li
            key={day.long}
            className={cn(
              "text-center text-caption",
              day.status === "today"
                ? "font-semibold text-foreground"
                : day.status === "upcoming"
                  ? "text-foreground-subtle"
                  : "text-foreground-muted",
            )}
          >
            {day.short}
          </li>
        ))}
      </ol>

      <figcaption className="mt-4 text-body-sm text-foreground-muted">
        {todayIndex === null ? (
          "Loading this week…"
        ) : (
          <>
            <span className="font-semibold text-foreground">{pluralize(total, "completion")}</span>{" "}
            so far this week
            {best ? ` · best day ${best.long} (${best.value})` : null}
          </>
        )}
      </figcaption>

      <details className="group/table mt-3 text-body-sm">
        <summary className="w-fit cursor-pointer rounded-md text-foreground-muted underline decoration-border-strong underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          View as table
        </summary>
        <table className="mt-3 w-full text-left">
          <caption className="sr-only">Completions per day this week</caption>
          <thead>
            <tr className="border-b border-border text-caption text-foreground-muted">
              <th scope="col" className="py-1.5 font-medium">
                Day
              </th>
              <th scope="col" className="py-1.5 text-right font-medium">
                Completed
              </th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day.long} className="border-b border-border/60 last:border-0">
                <th scope="row" className="py-1.5 font-normal text-foreground">
                  {day.long}
                  {day.status === "today" ? " (today)" : null}
                </th>
                <td className="py-1.5 text-right text-foreground tabular-nums">
                  {day.value ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

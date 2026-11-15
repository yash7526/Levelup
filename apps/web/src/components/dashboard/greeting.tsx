"use client";

import { formatLongDate, getGreeting } from "@levelup/utils";

import { useCurrentTime } from "@/lib/hooks/use-current-time";
import { APP_LOCALE } from "@/lib/locale";

/**
 * Time-of-day greeting in the viewer's own time zone. The server cannot know that
 * zone, so it renders a neutral greeting that is replaced on hydration.
 */
export function Greeting({ displayName }: { displayName: string | null }) {
  const now = useCurrentTime();

  const greeting = now
    ? getGreeting(now, displayName)
    : displayName
      ? `Hello, ${displayName}`
      : "Hello";

  return (
    <div className="min-w-0">
      <p className="mb-2 h-3.5 text-overline text-foreground-muted uppercase">
        {now ? <time dateTime={now.toISOString()}>{formatLongDate(now, APP_LOCALE)}</time> : null}
      </p>
      <h1 className="font-display text-heading-1 text-balance text-foreground sm:text-display">
        {greeting}
      </h1>
    </div>
  );
}

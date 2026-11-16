"use client";

import { toISODate } from "@levelup/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { TIME_ZONE_COOKIE } from "@/lib/preferences";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function readCookie(name: string): string | null {
  const entry = document.cookie.split("; ").find((cookie) => cookie.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

/**
 * Tells the server the viewer's time zone (via a cookie) so "today" means the viewer's
 * today, and refreshes the page when the zone changes or the local date rolls over.
 */
export function TimeZoneSync() {
  const router = useRouter();

  useEffect(() => {
    let day = toISODate(new Date());

    const sync = () => {
      let changed = false;
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (zone && readCookie(TIME_ZONE_COOKIE) !== zone) {
        const secure = window.location.protocol === "https:" ? "; secure" : "";
        document.cookie = `${TIME_ZONE_COOKIE}=${encodeURIComponent(zone)}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax${secure}`;
        changed = true;
      }
      const currentDay = toISODate(new Date());
      if (currentDay !== day) {
        day = currentDay;
        changed = true;
      }
      if (changed) router.refresh();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") sync();
    };

    sync();
    const timer = setInterval(sync, 60_000);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router]);

  return null;
}

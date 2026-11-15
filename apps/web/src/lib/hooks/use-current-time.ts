"use client";

import { useSyncExternalStore } from "react";

const TICK_MS = 60_000;

let now: Date | null = null;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function tick(): void {
  now = new Date();
  for (const listener of listeners) listener();
}

function onVisibilityChange(): void {
  if (document.visibilityState === "visible") tick();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) {
    timer = setInterval(tick, TICK_MS);
    document.addEventListener("visibilitychange", onVisibilityChange);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    }
  };
}

function getSnapshot(): Date {
  now ??= new Date();
  return now;
}

/**
 * The viewer's local time, refreshed every minute. Returns `null` during server
 * rendering and hydration, because the server cannot know the viewer's time zone;
 * render a neutral fallback for that case.
 */
export function useCurrentTime(): Date | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

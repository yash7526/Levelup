import {
  createHabit,
  createPriority,
  deletePriority,
  describeDataError,
  type HabitInput,
  loadGrowthData,
  movePriorityToDay,
  setHabitArchived,
  setHabitCheckin,
  setPriorityStatus,
  updateHabit,
} from "@levelup/supabase";
import type {
  DashboardSnapshot,
  GrowthData,
  HabitSummary,
  ISODateString,
  LifeArea,
} from "@levelup/types";
import {
  buildDashboardSnapshot,
  firstFreePosition,
  MAX_PRIORITIES_PER_DAY,
  summarizeActiveHabits,
  toISODate,
} from "@levelup/utils";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";

import { supabase } from "@/lib/supabase";
import { useNow } from "@/lib/use-now";

import { useAuth } from "./auth";

/** `null` when a change saved; otherwise a message to show. */
export type SaveError = string | null;

interface GrowthState {
  /** True when signed in to an account (Today and Habits need one). */
  available: boolean;
  /** The device's current calendar day. */
  today: ISODateString;
  /** `null` while loading (or when unavailable). */
  data: GrowthData | null;
  /** Why loading failed, if it did. */
  loadError: string | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
  /** Live dashboard data; `null` until loaded. */
  snapshot: DashboardSnapshot | null;
  /** Active habits summarised for today. */
  habits: readonly HabitSummary[];
  /** The calendar day a timestamp falls on, on this device. */
  toLocalDay: (instant: string) => ISODateString;

  addPriority: (title: string, area: LifeArea | null) => Promise<SaveError>;
  setPriorityDone: (id: string, done: boolean) => Promise<SaveError>;
  removePriority: (id: string) => Promise<SaveError>;
  moveToToday: (id: string) => Promise<SaveError>;
  setCheckin: (habitId: string, day: ISODateString, done: boolean) => Promise<SaveError>;
  saveHabit: (id: string | null, input: HabitInput) => Promise<SaveError>;
  setArchived: (id: string, archived: boolean) => Promise<SaveError>;
}

const GrowthContext = createContext<GrowthState | null>(null);

const toLocalDay = (instant: string): ISODateString => toISODate(new Date(instant));

type Store = { key: string; data: GrowthData };

/**
 * The signed-in user's priorities and habits, shared by Home, Today and Habits so a
 * change on one tab shows on the others. Changes appear at once and are then saved;
 * a failed save reloads from the server.
 */
export function GrowthProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const today = toISODate(useNow());
  // Data belongs to one user and day, so another account or a new day never shows stale data.
  const key = userId ? `${userId}:${today}` : null;

  const [store, setStore] = useState<Store | null>(null);
  const [loadFailure, setLoadFailure] = useState<{ key: string; message: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // Bumped by every local change; a load that started before a change is discarded.
  const version = useRef(0);

  const data = store && store.key === key ? store.data : null;
  const loadError = loadFailure && loadFailure.key === key ? loadFailure.message : null;

  const load = useCallback(async () => {
    const client = supabase;
    if (!client || !userId) return;
    const loadKey = `${userId}:${today}`;
    const startedAt = version.current;
    try {
      const next = await loadGrowthData(client, today);
      if (version.current !== startedAt) return;
      setStore({ key: loadKey, data: next });
      setLoadFailure(null);
    } catch (error) {
      console.warn("[growth] Failed to load", error);
      setLoadFailure({
        key: loadKey,
        message: describeDataError(
          error,
          "We couldn't load your priorities and habits. Check your connection and try again.",
        ),
      });
    }
  }, [userId, today]);

  useEffect(() => {
    // `load` only sets state after its network request resolves, never synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch
    void load();
  }, [load]);

  // Pick up changes made on other devices when the app returns to the foreground.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void load();
    });
    return () => subscription.remove();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const update = useCallback(
    (change: (current: GrowthData) => GrowthData) => {
      version.current += 1;
      setStore((current) =>
        current && current.key === key ? { key: current.key, data: change(current.data) } : current,
      );
    },
    [key],
  );

  /** Saves a change; on failure reloads the server's version and explains what happened. */
  const save = useCallback(
    async (action: () => Promise<unknown>, fallback: string): Promise<SaveError> => {
      if (!supabase) return "Accounts aren't set up on this build.";
      try {
        await action();
        return null;
      } catch (error) {
        console.warn("[growth] Save failed", error);
        void load();
        return describeDataError(error, fallback);
      }
    },
    [load],
  );

  const value = useMemo<GrowthState>(() => {
    const client = supabase;
    const habits = data ? summarizeActiveHabits(data, toLocalDay) : [];
    const snapshot = data ? buildDashboardSnapshot(data, toLocalDay) : null;
    const needClient =
      <T,>(run: (c: NonNullable<typeof client>) => Promise<T>) =>
      () => {
        if (!client) throw new Error("Supabase is not configured");
        return run(client);
      };

    return {
      available: Boolean(client && userId),
      today,
      data,
      loadError,
      refreshing,
      refresh,
      snapshot,
      habits,
      toLocalDay,

      addPriority: (title, area) =>
        save(
          needClient(async (c) => {
            const entry = await createPriority(c, { day: today, title, area });
            update((current) => ({ ...current, priorities: [...current.priorities, entry] }));
          }),
          "We couldn't add that priority. Please try again.",
        ),

      setPriorityDone: (id, done) => {
        update((current) => ({
          ...current,
          priorities: current.priorities.map((priority) =>
            priority.id === id
              ? {
                  ...priority,
                  status: done ? "done" : "open",
                  completedAt: done ? new Date().toISOString() : null,
                }
              : priority,
          ),
        }));
        return save(
          needClient((c) => setPriorityStatus(c, id, done ? "done" : "open")),
          "We couldn't update that priority. Please try again.",
        );
      },

      removePriority: (id) => {
        update((current) => ({
          ...current,
          priorities: current.priorities.filter((priority) => priority.id !== id),
          carryOver: current.carryOver.filter((priority) => priority.id !== id),
        }));
        return save(
          needClient((c) => deletePriority(c, id)),
          "We couldn't remove that priority. Please try again.",
        );
      },

      moveToToday: async (id) => {
        const todays = data?.priorities.filter((priority) => priority.day === today) ?? [];
        const position = firstFreePosition(todays.map((priority) => priority.position));
        const moved = data?.carryOver.find((priority) => priority.id === id);
        if (position === null) {
          return `You already have ${MAX_PRIORITIES_PER_DAY} priorities for today.`;
        }
        if (moved) {
          update((current) => ({
            ...current,
            priorities: [...current.priorities, { ...moved, day: today, position }],
            carryOver: current.carryOver.filter((priority) => priority.id !== id),
          }));
        }
        return save(
          needClient(async (c) => {
            const entry = await movePriorityToDay(c, id, today);
            // The server may have picked a different free slot.
            update((current) => ({
              ...current,
              priorities: current.priorities.map((priority) =>
                priority.id === id ? entry : priority,
              ),
            }));
          }),
          "We couldn't move that priority. Please try again.",
        );
      },

      setCheckin: (habitId, day, done) => {
        update((current) => {
          const others = current.checkins.filter(
            (checkin) => !(checkin.habitId === habitId && checkin.day === day),
          );
          return {
            ...current,
            checkins: done ? [...others, { id: `local:${habitId}:${day}`, habitId, day }] : others,
          };
        });
        return save(
          needClient((c) => setHabitCheckin(c, habitId, day, done)),
          "We couldn't save that check-in. Please try again.",
        );
      },

      saveHabit: (id, input) =>
        save(
          needClient(async (c) => {
            const habit = id ? await updateHabit(c, id, input) : await createHabit(c, input);
            update((current) => ({
              ...current,
              habits: id
                ? current.habits.map((existing) => (existing.id === id ? habit : existing))
                : [...current.habits, habit],
            }));
          }),
          "We couldn't save that habit. Please try again.",
        ),

      setArchived: (id, archived) =>
        save(
          needClient(async (c) => {
            const habit = await setHabitArchived(c, id, archived);
            update((current) => ({
              ...current,
              habits: current.habits.map((existing) => (existing.id === id ? habit : existing)),
            }));
          }),
          archived
            ? "We couldn't archive that habit. Please try again."
            : "We couldn't restore that habit. Please try again.",
        ),
    };
  }, [data, loadError, refreshing, refresh, save, today, update, userId]);

  return <GrowthContext.Provider value={value}>{children}</GrowthContext.Provider>;
}

export function useGrowth(): GrowthState {
  const context = useContext(GrowthContext);
  if (!context) throw new Error("useGrowth must be used inside <GrowthProvider>");
  return context;
}

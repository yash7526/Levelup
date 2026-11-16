import {
  addMilestone,
  createGoal,
  createLearningItem,
  deleteGoal,
  deleteLearningSession,
  deleteMilestone,
  describeDataError,
  type GoalInput,
  type LearningItemInput,
  loadPlanningData,
  logLearningSession,
  setGoalStatus,
  setLearningArchived,
  setLearningProgress,
  setMilestoneDone,
  updateGoal,
  updateLearningItem,
} from "@levelup/supabase";
import type { GoalStatus, ISODateString, PlanningData } from "@levelup/types";
import { toISODate } from "@levelup/utils";
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

interface PlanningState {
  available: boolean;
  today: ISODateString;
  /** `null` while loading (or when unavailable). */
  data: PlanningData | null;
  loadError: string | null;
  refreshing: boolean;
  refresh: () => Promise<void>;

  saveGoal: (id: string | null, input: GoalInput) => Promise<SaveError>;
  setGoalStatus: (id: string, status: GoalStatus) => Promise<SaveError>;
  deleteGoal: (id: string) => Promise<SaveError>;
  addMilestone: (goalId: string, title: string) => Promise<SaveError>;
  setMilestoneDone: (id: string, done: boolean) => Promise<SaveError>;
  deleteMilestone: (id: string) => Promise<SaveError>;

  saveLearningItem: (
    id: string | null,
    input: LearningItemInput,
    completed: number,
  ) => Promise<SaveError>;
  setLearningProgress: (id: string, completed: number) => Promise<SaveError>;
  setLearningArchived: (id: string, archived: boolean) => Promise<SaveError>;
  logSession: (itemId: string, minutes: number, note: string | null) => Promise<SaveError>;
  deleteSession: (id: string) => Promise<SaveError>;
}

const PlanningContext = createContext<PlanningState | null>(null);

type Store = { key: string; data: PlanningData };

/**
 * The signed-in user's goals and learning library, shared by Home, Goals and Learning.
 * Toggles and progress steps show at once; other changes save, then reload the lists.
 * A failed save reloads from the server and explains what happened.
 */
export function PlanningProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const today = toISODate(useNow());
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
      const next = await loadPlanningData(client, today);
      if (version.current !== startedAt) return;
      setStore({ key: loadKey, data: next });
      setLoadFailure(null);
    } catch (error) {
      console.warn("[planning] Failed to load", error);
      setLoadFailure({
        key: loadKey,
        message: describeDataError(
          error,
          "We couldn't load your goals and learning. Check your connection and try again.",
        ),
      });
    }
  }, [userId, today]);

  useEffect(() => {
    // `load` only sets state after its network request resolves, never synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch
    void load();
  }, [load]);

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
    (change: (current: PlanningData) => PlanningData) => {
      version.current += 1;
      setStore((current) =>
        current && current.key === key ? { key: current.key, data: change(current.data) } : current,
      );
    },
    [key],
  );

  /** Saves, then reloads so the lists match the server. On failure, reloads and explains. */
  const save = useCallback(
    async (action: () => Promise<unknown>, fallback: string): Promise<SaveError> => {
      try {
        await action();
        version.current += 1;
        await load();
        return null;
      } catch (error) {
        console.warn("[planning] Save failed", error);
        void load();
        return describeDataError(error, fallback);
      }
    },
    [load],
  );

  const value = useMemo<PlanningState>(() => {
    const client = supabase;
    /** Wraps a client call so a build without Supabase fails cleanly. */
    const withClient = (run: (c: NonNullable<typeof client>) => Promise<unknown>) => () => {
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

      saveGoal: (id, input) =>
        save(
          withClient((c) => (id ? updateGoal(c, id, input) : createGoal(c, input))),
          "We couldn't save that goal. Please try again.",
        ),
      setGoalStatus: (id, status) =>
        save(
          withClient((c) => setGoalStatus(c, id, status)),
          "We couldn't update that goal. Please try again.",
        ),
      deleteGoal: (id) =>
        save(
          withClient((c) => deleteGoal(c, id)),
          "We couldn't delete that goal. Please try again.",
        ),
      addMilestone: (goalId, title) =>
        save(
          withClient((c) => addMilestone(c, goalId, title)),
          "We couldn't add that milestone. Please try again.",
        ),
      setMilestoneDone: (id, done) => {
        update((current) => ({
          ...current,
          goals: current.goals.map((goal) => ({
            ...goal,
            milestones: goal.milestones.map((milestone) =>
              milestone.id === id
                ? { ...milestone, completedAt: done ? new Date().toISOString() : null }
                : milestone,
            ),
          })),
        }));
        return save(
          withClient((c) => setMilestoneDone(c, id, done)),
          "We couldn't update that milestone. Please try again.",
        );
      },
      deleteMilestone: (id) =>
        save(
          withClient((c) => deleteMilestone(c, id)),
          "We couldn't remove that milestone. Please try again.",
        ),

      saveLearningItem: (id, input, completed) =>
        save(
          withClient((c) =>
            id ? updateLearningItem(c, id, input, completed) : createLearningItem(c, input),
          ),
          "We couldn't save that. Please try again.",
        ),
      setLearningProgress: (id, completed) => {
        update((current) => ({
          ...current,
          learning: current.learning.map((item) =>
            item.id === id ? { ...item, completed } : item,
          ),
        }));
        return save(
          withClient((c) => setLearningProgress(c, id, completed)),
          "We couldn't save your progress. Please try again.",
        );
      },
      setLearningArchived: (id, archived) =>
        save(
          withClient((c) => setLearningArchived(c, id, archived)),
          "We couldn't update that item. Please try again.",
        ),
      logSession: (itemId, minutes, note) =>
        save(
          withClient((c) => logLearningSession(c, { itemId, day: today, minutes, note })),
          "We couldn't log that session. Please try again.",
        ),
      deleteSession: (id) =>
        save(
          withClient((c) => deleteLearningSession(c, id)),
          "We couldn't remove that session. Please try again.",
        ),
    };
  }, [data, loadError, refreshing, refresh, save, today, update, userId]);

  return <PlanningContext.Provider value={value}>{children}</PlanningContext.Provider>;
}

export function usePlanning(): PlanningState {
  const context = useContext(PlanningContext);
  if (!context) throw new Error("usePlanning must be used inside <PlanningProvider>");
  return context;
}

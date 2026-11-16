import "server-only";

import type { DashboardSnapshot } from "@levelup/types";
import { buildDashboardSnapshot, demoDashboard, emptyDashboard } from "@levelup/utils";

import { getGrowthContext, getGrowthData, getPlanningData } from "@/lib/growth/context";

export interface DashboardLoad {
  snapshot: DashboardSnapshot;
  /** Why live data couldn't be loaded; the snapshot is then empty and must not be shown as real. */
  loadError: string | null;
  /**
   * Why goals and learning couldn't be loaded. The rest of the dashboard is still real,
   * but those two cards are empty only because of the failure, so say so.
   */
  planningError: string | null;
}

interface Options {
  /** Explicitly requested, clearly labelled sample data. */
  demo: boolean;
}

/**
 * Loads everything the dashboard renders.
 *
 * Priorities, habits, weekly activity, goals and learning come from the signed-in user's
 * data. The coach stays empty until its module exists; no invented numbers. Without
 * accounts configured, the live dashboard is empty. Sample data lives in @levelup/utils
 * (shared with mobile).
 */
export async function getDashboardSnapshot({ demo }: Options): Promise<DashboardLoad> {
  if (demo) return { snapshot: demoDashboard, loadError: null, planningError: null };
  const context = await getGrowthContext();
  if (!context) return { snapshot: emptyDashboard, loadError: null, planningError: null };

  const [growth, planning] = await Promise.all([getGrowthData(context), getPlanningData(context)]);
  if (!growth.ok) {
    return { snapshot: emptyDashboard, loadError: growth.message, planningError: null };
  }
  return {
    snapshot: buildDashboardSnapshot(
      growth.data,
      context.toLocalDay,
      planning.ok ? planning.data : null,
    ),
    loadError: null,
    planningError: planning.ok ? null : planning.message,
  };
}

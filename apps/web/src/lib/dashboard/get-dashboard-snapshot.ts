import "server-only";

import type { DashboardSnapshot } from "@levelup/types";
import { buildDashboardSnapshot, demoDashboard, emptyDashboard } from "@levelup/utils";

import { getGrowthContext, getGrowthData } from "@/lib/growth/context";

export interface DashboardLoad {
  snapshot: DashboardSnapshot;
  /** Why live data couldn't be loaded; the snapshot is then empty and must not be shown as real. */
  loadError: string | null;
}

interface Options {
  /** Explicitly requested, clearly labelled sample data. */
  demo: boolean;
}

/**
 * Loads everything the dashboard renders.
 *
 * Priorities, habits and weekly activity come from the signed-in user's data. Goals,
 * learning and the coach stay empty until their modules exist; no invented numbers.
 * Without accounts configured, the live dashboard is empty. Sample data lives in
 * @levelup/utils (shared with mobile).
 */
export async function getDashboardSnapshot({ demo }: Options): Promise<DashboardLoad> {
  if (demo) return { snapshot: demoDashboard, loadError: null };
  const context = await getGrowthContext();
  if (!context) return { snapshot: emptyDashboard, loadError: null };
  const load = await getGrowthData(context);
  return load.ok
    ? { snapshot: buildDashboardSnapshot(load.data, context.toLocalDay), loadError: null }
    : { snapshot: emptyDashboard, loadError: load.message };
}

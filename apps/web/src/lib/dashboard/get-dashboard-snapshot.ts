import "server-only";

import type { DashboardSnapshot } from "@levelup/types";
import { demoDashboard, emptyDashboard } from "@levelup/utils";

interface Options {
  /** Explicitly requested, clearly labelled sample data. */
  demo: boolean;
}

/**
 * Loads everything the dashboard renders.
 *
 * Live data sources (priorities, habits, goals, learning, activity, coach) are added
 * by their respective module milestones. Until then the live dashboard is honestly
 * empty — no invented numbers. Sample data lives in @levelup/utils (shared with mobile).
 */
export function getDashboardSnapshot({ demo }: Options): Promise<DashboardSnapshot> {
  return Promise.resolve(demo ? demoDashboard : emptyDashboard);
}

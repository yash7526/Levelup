import type { GrowthData, ISODateString } from "@levelup/types";
import { addDays, startOfIsoWeek } from "@levelup/utils";

import type { LevelUpSupabaseClient } from "./client";
import { listCheckins, listHabits } from "./habits";
import { listCarryOverPriorities, listPriorities } from "./priorities";

/**
 * How much check-in history is loaded. Streaks are computed from it, so a streak
 * longer than this shows as this long; generous enough for now.
 */
export const CHECKIN_HISTORY_DAYS = 400;

/** Loads the signed-in user's Today and Habits data around their calendar day `today`. */
export async function loadGrowthData(
  client: LevelUpSupabaseClient,
  today: ISODateString,
): Promise<GrowthData> {
  const [habits, checkins, priorities, carryOver] = await Promise.all([
    listHabits(client),
    listCheckins(client, addDays(today, -CHECKIN_HISTORY_DAYS), today),
    listPriorities(client, startOfIsoWeek(today), today),
    listCarryOverPriorities(client, today),
  ]);
  return { today, habits, checkins, priorities, carryOver };
}

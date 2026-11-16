import type { ISODateString, PlanningData } from "@levelup/types";

import type { LevelUpSupabaseClient } from "./client";
import { listGoals } from "./goals";
import { listLearningItems, listLearningSessions } from "./learning";

/** Loads the signed-in user's goals, learning library and recent sessions. */
export async function loadPlanningData(
  client: LevelUpSupabaseClient,
  today: ISODateString,
): Promise<PlanningData> {
  const [goals, learning, sessions] = await Promise.all([
    listGoals(client),
    listLearningItems(client),
    listLearningSessions(client),
  ]);
  return { today, goals, learning, sessions };
}

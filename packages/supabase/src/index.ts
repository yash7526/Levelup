export {
  describeSupabaseProject,
  parseSupabaseConfig,
  type SupabaseConfig,
  type SupabaseConfigInput,
} from "./config";
export { createLevelUpClient, type LevelUpSupabaseClient } from "./client";
export { fetchProfile, mapProfileRow, updateProfileDisplayName, type ProfileRow } from "./profiles";
export {
  describeAuthError,
  isExistingAccountSignUp,
  normalizeEmail,
  normalizeOtp,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  validateEmail,
  validateOtp,
  validatePassword,
  type AuthErrorLike,
  type AuthFieldErrors,
} from "./auth";
export type { Database, Json, Tables, TablesInsert, TablesUpdate } from "./database.types";
export { describeDataError, isDataError, LevelUpDataError, type DataErrorCode } from "./errors";
export {
  CARRY_OVER_DAYS,
  createPriority,
  deletePriority,
  listCarryOverPriorities,
  listPriorities,
  mapPriorityRow,
  movePriorityToDay,
  setPriorityStatus,
  type NewPriority,
  type PriorityRow,
} from "./priorities";
export {
  createHabit,
  listCheckins,
  listHabits,
  mapHabitRow,
  setHabitArchived,
  setHabitCheckin,
  updateHabit,
  type HabitInput,
  type HabitRow,
} from "./habits";
export { CHECKIN_HISTORY_DAYS, loadGrowthData } from "./growth";
export {
  addMilestone,
  createGoal,
  deleteGoal,
  deleteMilestone,
  listGoals,
  mapGoalRow,
  mapMilestoneRow,
  setGoalStatus,
  setMilestoneDone,
  updateGoal,
  type GoalInput,
  type GoalRow,
  type MilestoneRow,
} from "./goals";
export {
  createLearningItem,
  deleteLearningSession,
  listLearningItems,
  listLearningSessions,
  logLearningSession,
  mapLearningItemRow,
  mapLearningSessionRow,
  SESSION_HISTORY_LIMIT,
  setLearningArchived,
  setLearningProgress,
  updateLearningItem,
  type LearningItemInput,
  type LearningItemRow,
  type LearningSessionRow,
  type SessionInput,
} from "./learning";
export { loadPlanningData } from "./planning";

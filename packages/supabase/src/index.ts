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

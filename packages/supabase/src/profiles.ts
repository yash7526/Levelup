import type { UserProfile } from "@levelup/types";

import type { LevelUpSupabaseClient } from "./client";
import type { Tables } from "./database.types";

export type ProfileRow = Tables<"profiles">;

export function mapProfileRow(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    timezone: row.timezone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Reads a profile. Row-level security only exposes the signed-in user's own row.
 * Returns `null` when no profile exists.
 */
export async function fetchProfile(
  client: LevelUpSupabaseClient,
  userId: string,
): Promise<UserProfile | null> {
  const { data, error } = await client
    .from("profiles")
    .select("id, display_name, avatar_url, timezone, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load profile: ${error.message}`);
  return data ? mapProfileRow(data) : null;
}

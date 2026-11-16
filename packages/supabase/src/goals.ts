import type { Goal, GoalMilestone, GoalStatus, ISODateString, LifeArea } from "@levelup/types";
import { isLifeArea, MAX_MILESTONES_PER_GOAL } from "@levelup/utils";

import type { LevelUpSupabaseClient } from "./client";
import type { Tables } from "./database.types";
import { LevelUpDataError, throwQueryError } from "./errors";

const GOAL_COLUMNS = "id, title, area, status, target_date, completed_at, created_at";
const MILESTONE_COLUMNS = "id, goal_id, title, position, completed_at";

export type GoalRow = Pick<
  Tables<"goals">,
  "id" | "title" | "area" | "status" | "target_date" | "completed_at" | "created_at"
>;
export type MilestoneRow = Pick<
  Tables<"goal_milestones">,
  "id" | "goal_id" | "title" | "position" | "completed_at"
>;

function toStatus(value: string): GoalStatus {
  return value === "paused" || value === "completed" ? value : "active";
}

export function mapMilestoneRow(row: MilestoneRow): GoalMilestone {
  return {
    id: row.id,
    goalId: row.goal_id,
    title: row.title,
    position: row.position,
    completedAt: row.completed_at,
  };
}

export function mapGoalRow(row: GoalRow, milestones: readonly GoalMilestone[] = []): Goal {
  return {
    id: row.id,
    title: row.title,
    area: isLifeArea(row.area) ? row.area : null,
    status: toStatus(row.status),
    targetDate: row.target_date,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    milestones: [...milestones].sort((a, b) => a.position - b.position),
  };
}

/** Every goal with its milestones, newest goal first. */
export async function listGoals(client: LevelUpSupabaseClient): Promise<Goal[]> {
  const [goals, milestones] = await Promise.all([
    client.from("goals").select(GOAL_COLUMNS).order("created_at", { ascending: false }),
    client.from("goal_milestones").select(MILESTONE_COLUMNS).order("position"),
  ]);
  if (goals.error) throwQueryError("load goals", goals.error);
  if (milestones.error) throwQueryError("load milestones", milestones.error);

  const byGoal = new Map<string, GoalMilestone[]>();
  for (const row of milestones.data) {
    const list = byGoal.get(row.goal_id) ?? [];
    list.push(mapMilestoneRow(row));
    byGoal.set(row.goal_id, list);
  }
  return goals.data.map((row) => mapGoalRow(row, byGoal.get(row.id)));
}

export interface GoalInput {
  title: string;
  area: LifeArea | null;
  targetDate: ISODateString | null;
}

export async function createGoal(
  client: LevelUpSupabaseClient,
  { title, area, targetDate }: GoalInput,
): Promise<Goal> {
  const { data, error } = await client
    .from("goals")
    .insert({ title, area, target_date: targetDate })
    .select(GOAL_COLUMNS)
    .single();
  if (error) throwQueryError("create the goal", error);
  return mapGoalRow(data);
}

export async function updateGoal(
  client: LevelUpSupabaseClient,
  id: string,
  { title, area, targetDate }: GoalInput,
): Promise<void> {
  const { data, error } = await client
    .from("goals")
    .update({ title, area, target_date: targetDate })
    .eq("id", id)
    .select("id");
  if (error) throwQueryError("update the goal", error);
  if (data.length === 0) throw new LevelUpDataError("not_found", "That goal no longer exists.");
}

export async function setGoalStatus(
  client: LevelUpSupabaseClient,
  id: string,
  status: GoalStatus,
): Promise<void> {
  const { data, error } = await client
    .from("goals")
    .update({
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select("id");
  if (error) throwQueryError("update the goal", error);
  if (data.length === 0) throw new LevelUpDataError("not_found", "That goal no longer exists.");
}

export async function deleteGoal(client: LevelUpSupabaseClient, id: string): Promise<void> {
  const { error } = await client.from("goals").delete().eq("id", id);
  if (error) throwQueryError("delete the goal", error);
}

/** Adds a milestone at the end of a goal's list. */
export async function addMilestone(
  client: LevelUpSupabaseClient,
  goalId: string,
  title: string,
): Promise<GoalMilestone> {
  const { data: existing, error: countError } = await client
    .from("goal_milestones")
    .select("position")
    .eq("goal_id", goalId)
    .order("position", { ascending: false });
  if (countError) throwQueryError("add the milestone", countError);
  if (existing.length >= MAX_MILESTONES_PER_GOAL) {
    throw new LevelUpDataError(
      "limit_reached",
      `A goal can have up to ${MAX_MILESTONES_PER_GOAL} milestones.`,
    );
  }
  const position = (existing[0]?.position ?? -1) + 1;
  const { data, error } = await client
    .from("goal_milestones")
    .insert({ goal_id: goalId, title, position })
    .select(MILESTONE_COLUMNS)
    .single();
  if (error) throwQueryError("add the milestone", error);
  return mapMilestoneRow(data);
}

export async function setMilestoneDone(
  client: LevelUpSupabaseClient,
  id: string,
  done: boolean,
): Promise<void> {
  const { data, error } = await client
    .from("goal_milestones")
    .update({ completed_at: done ? new Date().toISOString() : null })
    .eq("id", id)
    .select("id");
  if (error) throwQueryError("update the milestone", error);
  if (data.length === 0) {
    throw new LevelUpDataError("not_found", "That milestone no longer exists.");
  }
}

export async function deleteMilestone(client: LevelUpSupabaseClient, id: string): Promise<void> {
  const { error } = await client.from("goal_milestones").delete().eq("id", id);
  if (error) throwQueryError("remove the milestone", error);
}

/**
 * Database schema types.
 *
 * Mirrors `supabase/migrations`. Once a Supabase project is linked, regenerate with:
 *   pnpm dlx supabase gen types typescript --linked > packages/supabase/src/database.types.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          timezone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      priorities: {
        Row: {
          id: string;
          user_id: string;
          day: string;
          position: number;
          title: string;
          area: string | null;
          status: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          day: string;
          position: number;
          title: string;
          area?: string | null;
          status?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          day?: string;
          position?: number;
          title?: string;
          area?: string | null;
          status?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          area: string | null;
          schedule_type: string;
          schedule_days: number[] | null;
          weekly_target: number | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          area?: string | null;
          schedule_type?: string;
          schedule_days?: number[] | null;
          weekly_target?: number | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          area?: string | null;
          schedule_type?: string;
          schedule_days?: number[] | null;
          weekly_target?: number | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      habit_checkins: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          day: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          habit_id: string;
          day: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          habit_id?: string;
          day?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "habit_checkins_habit_id_user_id_fkey";
            columns: ["habit_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "habits";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];

import { fetchProfile } from "@levelup/supabase";
import type { Viewer } from "@levelup/types";
import { normalizeDisplayName } from "@levelup/utils";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

import { useAuth } from "./auth";
import { usePreferences } from "./preferences";

interface ViewerState extends Viewer {
  /** Re-reads the profile, e.g. after the name is changed in Settings. */
  refreshProfile: () => Promise<void>;
}

const ViewerContext = createContext<ViewerState | null>(null);

/**
 * Who is using the app:
 * - accounts enabled → the signed-in user (profile name, falling back to the sign-up name);
 * - accounts disabled → a local viewer named in Settings on this device.
 */
export function ViewerProvider({ children }: { children: ReactNode }) {
  const { enabled, session } = useAuth();
  const { preferredName } = usePreferences();
  const user = session?.user ?? null;
  const userId = user?.id ?? null;
  // Tagged with its owner so a previous account's name never shows after switching users.
  const [profile, setProfile] = useState<{ userId: string; name: string | null } | null>(null);
  const profileName = profile && profile.userId === userId ? profile.name : null;

  // Load the profile whenever the signed-in user changes. The `active` flag drops a slow
  // response for a previous user so it can't overwrite the current one.
  useEffect(() => {
    const client = supabase;
    if (!userId || !client) return;
    let active = true;
    fetchProfile(client, userId)
      .then((row) => {
        if (active) setProfile({ userId, name: normalizeDisplayName(row?.displayName) });
      })
      .catch((error: unknown) => {
        // A Supabase outage must never break the app; keep the sign-up name as fallback.
        console.warn("[viewer] Failed to load profile", error);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const refreshProfile = useCallback(async () => {
    if (!userId || !supabase) return;
    const row = await fetchProfile(supabase, userId);
    setProfile({ userId, name: normalizeDisplayName(row?.displayName) });
  }, [userId]);

  const value = useMemo<ViewerState>(() => {
    if (!enabled) {
      return { isAuthenticated: false, email: null, displayName: preferredName, refreshProfile };
    }
    if (!user) {
      return { isAuthenticated: false, email: null, displayName: null, refreshProfile };
    }
    const signUpName =
      typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : null;
    return {
      isAuthenticated: true,
      email: user.email ?? null,
      displayName: profileName ?? normalizeDisplayName(signUpName),
      refreshProfile,
    };
  }, [enabled, user, preferredName, profileName, refreshProfile]);

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}

export function useViewer(): ViewerState {
  const context = useContext(ViewerContext);
  if (!context) throw new Error("useViewer must be used inside <ViewerProvider>");
  return context;
}

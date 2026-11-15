import { fetchProfile } from "@levelup/supabase";
import type { Viewer } from "@levelup/types";
import { normalizeDisplayName } from "@levelup/utils";
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";

import { usePreferences } from "./preferences";

const ViewerContext = createContext<Viewer | null>(null);

/**
 * Resolves who is using the app:
 * - signed in with Supabase → name from `public.profiles`, falling back to the local name;
 * - otherwise → the preferred name saved on this device in Settings, if any.
 */
export function ViewerProvider({ children }: { children: ReactNode }) {
  const { preferredName } = usePreferences();
  const [session, setSession] = useState<{ signedIn: boolean; profileName: string | null }>({
    signedIn: false,
    profileName: null,
  });

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let active = true;

    async function load() {
      if (!client) return;
      try {
        const { data } = await client.auth.getClaims();
        const userId = data?.claims.sub;
        const profile = userId ? await fetchProfile(client, userId) : null;
        if (active) {
          setSession({
            signedIn: Boolean(userId),
            profileName: normalizeDisplayName(profile?.displayName),
          });
        }
      } catch (error) {
        // A Supabase outage must never break the app; fall back to local data.
        console.warn("[viewer] Failed to resolve Supabase session", error);
      }
    }

    void load();
    const { data } = client.auth.onAuthStateChange(() => void load());
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const viewer = useMemo<Viewer>(
    () => ({
      isAuthenticated: session.signedIn,
      displayName: session.profileName ?? preferredName,
    }),
    [session, preferredName],
  );

  return <ViewerContext.Provider value={viewer}>{children}</ViewerContext.Provider>;
}

export function useViewer(): Viewer {
  const context = useContext(ViewerContext);
  if (!context) throw new Error("useViewer must be used inside <ViewerProvider>");
  return context;
}

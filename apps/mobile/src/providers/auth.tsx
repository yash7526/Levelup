import type { Session } from "@supabase/supabase-js";
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

interface AuthState {
  /** False when Supabase isn't configured: the app then runs without accounts. */
  enabled: boolean;
  /** False until the stored session has been read (the splash screen stays up meanwhile). */
  ready: boolean;
  session: Session | null;
  /**
   * True while a password reset is completing. Verifying the reset code already signs
   * the user in, but the new password still has to be saved — so the account screens
   * stay mounted until `endRecovery()`.
   */
  recovering: boolean;
  beginRecovery: () => void;
  endRecovery: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const enabled = supabase !== null;
  const [ready, setReady] = useState(!enabled);
  const [session, setSession] = useState<Session | null>(null);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let active = true;

    void client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setReady(true);
    });
    const { data } = client.auth.onAuthStateChange((_event, next) => {
      if (active) setSession(next);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const beginRecovery = useCallback(() => setRecovering(true), []);
  const endRecovery = useCallback(() => setRecovering(false), []);

  const value = useMemo<AuthState>(
    () => ({ enabled, ready, session, recovering, beginRecovery, endRecovery }),
    [enabled, ready, session, recovering, beginRecovery, endRecovery],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

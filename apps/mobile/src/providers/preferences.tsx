import type { ThemePreference } from "@levelup/types";
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

import { readItem, storageKeys, writeItem } from "@/lib/storage";

interface Preferences {
  /** False until stored preferences have loaded (the splash screen stays up meanwhile). */
  ready: boolean;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  /** Name used in greetings before accounts exist. Stored on this device only. */
  preferredName: string | null;
  setPreferredName: (name: string | null) => Promise<void>;
}

const PreferencesContext = createContext<Preferences | null>(null);

function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [themePreference, setTheme] = useState<ThemePreference>("system");
  const [preferredName, setName] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [storedTheme, storedName] = await Promise.all([
        readItem(storageKeys.theme),
        readItem(storageKeys.preferredName),
      ]);
      if (!active) return;
      if (isThemePreference(storedTheme)) setTheme(storedTheme);
      setName(normalizeDisplayName(storedName));
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const setThemePreference = useCallback((preference: ThemePreference) => {
    setTheme(preference);
    void writeItem(storageKeys.theme, preference);
  }, []);

  const setPreferredName = useCallback(async (name: string | null) => {
    const normalized = normalizeDisplayName(name);
    setName(normalized);
    await writeItem(storageKeys.preferredName, normalized);
  }, []);

  const value = useMemo<Preferences>(
    () => ({
      ready,
      themePreference,
      setThemePreference,
      preferredName,
      setPreferredName,
    }),
    [ready, themePreference, setThemePreference, preferredName, setPreferredName],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): Preferences {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("usePreferences must be used inside <PreferencesProvider>");
  return context;
}

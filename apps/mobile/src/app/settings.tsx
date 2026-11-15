import { describeSupabaseProject, updateProfileDisplayName } from "@levelup/supabase";
import { DISPLAY_NAME_MAX_LENGTH, normalizeDisplayName } from "@levelup/utils";
import Constants from "expo-constants";
import { CircleCheck, LogOut } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppText } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";
import { supabase, supabaseConfig } from "@/lib/supabase";
import { useAuth } from "@/providers/auth";
import { usePreferences } from "@/providers/preferences";
import { useViewer } from "@/providers/viewer";
import { useTheme } from "@/theme/use-theme";

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.sectionTitle}>
      <AppText variant="heading-3" accessibilityRole="header">
        {title}
      </AppText>
      <AppText variant="body-sm" tone="muted">
        {description}
      </AppText>
    </View>
  );
}

type Status = { kind: "idle" | "saved" | "error"; message?: string };

/**
 * Signed in: saves the name to the LevelUp account (`public.profiles`).
 * Accounts off (no Supabase): saves it on this device.
 */
function NameForm({ initialName }: { initialName: string | null }) {
  const { colors } = useTheme();
  const { session } = useAuth();
  const { setPreferredName } = usePreferences();
  const { isAuthenticated, refreshProfile } = useViewer();
  const [value, setValue] = useState(initialName ?? "");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (Array.from(value.trim()).length > DISPLAY_NAME_MAX_LENGTH) {
      setStatus({
        kind: "error",
        message: `Keep it to ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.`,
      });
      return;
    }
    const name = normalizeDisplayName(value);
    setSaving(true);
    try {
      if (isAuthenticated && supabase && session) {
        await updateProfileDisplayName(supabase, session.user.id, name);
        await refreshProfile();
      } else {
        await setPreferredName(name);
      }
      setValue(name ?? "");
      setStatus({
        kind: "saved",
        message: name ? `Saved. We'll call you ${name}.` : "Name removed.",
      });
    } catch (error) {
      console.warn("[settings] Failed to save name", error);
      setStatus({ kind: "error", message: "We couldn't save your name. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.form}>
      <TextField
        label="Your name"
        value={value}
        onChangeText={(text) => {
          setValue(text);
          if (status.kind !== "idle") setStatus({ kind: "idle" });
        }}
        placeholder="e.g. Sam"
        autoComplete="given-name"
        textContentType="givenName"
        autoCapitalize="words"
        returnKeyType="done"
        maxLength={DISPLAY_NAME_MAX_LENGTH}
        onSubmitEditing={() => void save()}
        hint={
          isAuthenticated
            ? "Used in your greeting. Saved to your LevelUp account, so it follows you to every device."
            : "Used in your dashboard greeting. Saved on this device. Leave blank to remove."
        }
        error={status.kind === "error" ? status.message : undefined}
      />
      <View style={styles.formActions}>
        <Button label="Save name" loading={saving} onPress={() => void save()} />
        {status.kind === "saved" ? (
          <View style={styles.saved} accessibilityLiveRegion="polite">
            <CircleCheck size={16} color={colors.success} />
            <AppText variant="body-sm" tone="success" style={styles.savedText}>
              {status.message}
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { colors } = useTheme();
  const viewer = useViewer();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    if (!supabase) return;
    setSigningOut(true);
    // Navigation switches to the sign-in screen when the session ends.
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn("[settings] Sign-out failed", error);
      setSigningOut(false);
    }
  }

  return (
    <Screen kind="stack">
      <Card style={styles.section}>
        <SectionTitle title="Profile" description="How LevelUp greets you" />
        {/* Re-initialise when the profile name arrives from the server. */}
        <NameForm key={viewer.displayName ?? ""} initialName={viewer.displayName} />
      </Card>

      <Card style={styles.section}>
        <SectionTitle
          title="Appearance"
          description="Choose a theme, or follow your device setting"
        />
        <ThemeSwitcher />
      </Card>

      <Card style={styles.section}>
        <SectionTitle title="Account & sync" description="Your account and backend connection" />
        <View style={styles.row}>
          <AppText variant="body-sm" tone="muted">
            Supabase
          </AppText>
          {supabaseConfig ? (
            <Badge
              label={`Connected to ${describeSupabaseProject(supabaseConfig)}`}
              variant="success"
            />
          ) : (
            <Badge label="Not configured" variant="outline" />
          )}
        </View>
        <View style={styles.row}>
          <AppText variant="body-sm" tone="muted">
            Signed in as
          </AppText>
          <AppText variant="body-sm" numberOfLines={1} style={styles.email}>
            {viewer.isAuthenticated ? (viewer.email ?? "Your account") : "Not signed in"}
          </AppText>
        </View>
        {viewer.isAuthenticated ? (
          <Button
            label="Sign out"
            variant="outline"
            size="sm"
            icon={LogOut}
            loading={signingOut}
            onPress={() => void signOut()}
          />
        ) : null}
        {!supabaseConfig ? (
          <View style={[styles.note, { backgroundColor: colors.surfaceMuted }]}>
            <AppText variant="body-sm" tone="muted">
              Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to
              apps/mobile/.env, then restart Expo to enable accounts.
            </AppText>
          </View>
        ) : null}
      </Card>

      <AppText variant="caption" tone="subtle" style={styles.version}>
        LevelUp {Constants.expoConfig?.version ?? ""}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: 16 },
  sectionTitle: { gap: 2 },
  form: { gap: 16 },
  formActions: { gap: 12 },
  saved: { flexDirection: "row", alignItems: "center", gap: 6 },
  savedText: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  email: { flexShrink: 1, textAlign: "right" },
  note: { borderRadius: 12, padding: 12 },
  version: { textAlign: "center", marginTop: 8 },
});

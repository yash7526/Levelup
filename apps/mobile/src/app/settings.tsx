import { describeSupabaseProject } from "@levelup/supabase";
import { DISPLAY_NAME_MAX_LENGTH, normalizeDisplayName } from "@levelup/utils";
import Constants from "expo-constants";
import { CircleCheck } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import { AppText } from "@/components/ui/text";
import { supabaseConfig } from "@/lib/supabase";
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

function PreferredNameForm() {
  const { colors } = useTheme();
  const { preferredName, setPreferredName } = usePreferences();
  const [value, setValue] = useState(preferredName ?? "");
  const [status, setStatus] = useState<{ kind: "idle" | "saved" | "error"; message?: string }>({
    kind: "idle",
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (Array.from(value.trim()).length > DISPLAY_NAME_MAX_LENGTH) {
      setStatus({
        kind: "error",
        message: `Keep it to ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.`,
      });
      return;
    }
    setSaving(true);
    const name = normalizeDisplayName(value);
    await setPreferredName(name);
    setValue(name ?? "");
    setSaving(false);
    setStatus({
      kind: "saved",
      message: name ? `Saved. We'll call you ${name}.` : "Name removed.",
    });
  }

  return (
    <View style={styles.form}>
      <TextField
        label="Preferred name"
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
        hint="Used in your dashboard greeting. Saved on this device until accounts are available. Leave blank to remove."
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

  return (
    <Screen kind="stack">
      <Card style={styles.section}>
        <SectionTitle title="Profile" description="How LevelUp greets you" />
        <PreferredNameForm />
      </Card>

      <Card style={styles.section}>
        <SectionTitle
          title="Appearance"
          description="Choose a theme, or follow your device setting"
        />
        <ThemeSwitcher />
      </Card>

      <Card style={styles.section}>
        <SectionTitle title="Account & sync" description="Backend connection for this build" />
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
            Session
          </AppText>
          <AppText variant="body-sm">
            {viewer.isAuthenticated ? "Signed in" : "Not signed in"}
          </AppText>
        </View>
        {!supabaseConfig ? (
          <View style={[styles.note, { backgroundColor: colors.surfaceMuted }]}>
            <AppText variant="body-sm" tone="muted">
              Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to
              apps/mobile/.env, then restart Expo. Sign-in arrives with the accounts milestone.
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
  note: { borderRadius: 12, padding: 12 },
  version: { textAlign: "center", marginTop: 8 },
});

import { FlaskConical } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/button";
import { AppText } from "@/components/ui/text";
import { alpha } from "@/theme/theme";
import { useTheme } from "@/theme/use-theme";

/** Shown whenever the dashboard renders sample data. */
export function DemoBanner({ onExit }: { onExit: () => void }) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="summary"
      style={[
        styles.banner,
        { backgroundColor: colors.warningSubtle, borderColor: alpha(colors.warning, 0.5) },
      ]}
    >
      <View style={styles.row}>
        <FlaskConical size={20} color={colors.warning} />
        <View style={styles.copy}>
          <AppText variant="label" style={styles.title}>
            You&apos;re viewing sample data
          </AppText>
          <AppText variant="body-sm" tone="muted">
            Everything below is illustrative and not connected to your account. It exists to preview
            the dashboard design.
          </AppText>
        </View>
      </View>
      <Button label="Exit preview" variant="outline" size="sm" onPress={onExit} />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: 20, borderWidth: 1, borderStyle: "dashed", padding: 16, gap: 14 },
  row: { flexDirection: "row", gap: 12 },
  copy: { flex: 1, gap: 2 },
  title: { fontFamily: "Inter_600SemiBold" },
});

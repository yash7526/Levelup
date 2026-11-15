import Constants from "expo-constants";
import { GraduationCap, Settings, Sparkles } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { PageHeader, Screen } from "@/components/layout/screen";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Card } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { AppText } from "@/components/ui/text";
import { useTheme } from "@/theme/use-theme";

export default function MoreScreen() {
  const { colors } = useTheme();
  const divider = {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 66,
  };

  return (
    <Screen kind="tab">
      <PageHeader title="More" />

      <Card style={styles.list}>
        <ListRow
          href="/learning"
          label="Learning"
          description="Courses, books and skills"
          icon={GraduationCap}
        />
        <View style={divider} />
        <ListRow href="/coach" label="AI Coach" description="Personal guidance" icon={Sparkles} />
        <View style={divider} />
        <ListRow
          href="/settings"
          label="Settings"
          description="Profile, appearance and sync"
          icon={Settings}
        />
      </Card>

      <Card style={styles.section}>
        <AppText variant="heading-3" accessibilityRole="header">
          Appearance
        </AppText>
        <ThemeSwitcher />
      </Card>

      <AppText variant="caption" tone="subtle" style={styles.version}>
        LevelUp {Constants.expoConfig?.version ?? ""}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: 0, overflow: "hidden" },
  section: { gap: 14 },
  version: { textAlign: "center", marginTop: 8 },
});

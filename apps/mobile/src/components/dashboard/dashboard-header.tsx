import type { Viewer } from "@levelup/types";
import { APP_LOCALE, formatLongDate, getGreeting } from "@levelup/utils";
import { Link } from "expo-router";
import { FlaskConical } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/button";
import { AppText } from "@/components/ui/text";
import { useNow } from "@/lib/use-now";
import { useTheme } from "@/theme/use-theme";

interface DashboardHeaderProps {
  viewer: Viewer;
  isDemo: boolean;
  demoEnabled: boolean;
  onShowSample: () => void;
}

export function DashboardHeader({
  viewer,
  isDemo,
  demoEnabled,
  onShowSample,
}: DashboardHeaderProps) {
  const now = useNow();
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <AppText variant="overline" tone="muted">
        {formatLongDate(now, APP_LOCALE)}
      </AppText>
      <AppText variant="heading-1" accessibilityRole="header">
        {getGreeting(now, viewer.displayName)}
      </AppText>
      <AppText variant="body-lg" tone="muted">
        {viewer.displayName ? (
          "Here's where today stands."
        ) : (
          <>
            Small steps, every day.{" "}
            <Link
              href="/settings"
              style={{
                color: colors.foreground,
                fontFamily: "Inter_500Medium",
                textDecorationLine: "underline",
              }}
            >
              Add your name
            </Link>{" "}
            to personalise LevelUp.
          </>
        )}
      </AppText>
      {demoEnabled && !isDemo ? (
        <Button
          label="Preview with sample data"
          variant="outline"
          size="sm"
          icon={FlaskConical}
          onPress={onShowSample}
          style={styles.preview}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6, marginBottom: 4 },
  preview: { marginTop: 10 },
});

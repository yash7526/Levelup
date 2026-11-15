import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@/theme/use-theme";

import type { IconComponent } from "./icon";
import { AppText } from "./text";

interface EmptyStateProps {
  icon: IconComponent;
  title: string;
  description: string;
  /** A single, real next step — usually a link to the relevant module. */
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconTile, { backgroundColor: colors.surfaceMuted }]}>
        <Icon size={20} color={colors.foregroundMuted} />
      </View>
      <View style={styles.copy}>
        <AppText variant="heading-3" style={styles.center}>
          {title}
        </AppText>
        <AppText variant="body-sm" tone="muted" style={styles.center}>
          {description}
        </AppText>
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 12, paddingVertical: 12 },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { gap: 4, maxWidth: 320 },
  center: { textAlign: "center" },
  action: { marginTop: 4, alignItems: "center" },
});

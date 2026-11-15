import { type ModuleKey, moduleCopy } from "@levelup/utils";
import { ArrowLeft, Check } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { PageHeader, Screen } from "@/components/layout/screen";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { IconComponent } from "@/components/ui/icon";
import { AppText } from "@/components/ui/text";
import { alpha } from "@/theme/theme";
import { useTheme } from "@/theme/use-theme";

interface ModulePreviewProps {
  module: ModuleKey;
  icon: IconComponent;
  /** Tab screens show the title in the page; stack screens show it in the native header. */
  kind: "tab" | "stack";
}

/**
 * Screen for a module that is planned but not yet built. Honest about status and
 * always offers a real way back, so navigation never dead-ends.
 */
export function ModulePreview({ module, icon: Icon, kind }: ModulePreviewProps) {
  const { colors } = useTheme();
  const copy = moduleCopy[module];

  return (
    <Screen kind={kind}>
      {kind === "tab" ? (
        <PageHeader title={copy.title} description={copy.tagline}>
          <Badge label="In development" variant="accent" style={styles.badge} />
        </PageHeader>
      ) : (
        <View style={styles.stackIntro}>
          <AppText variant="body-lg" tone="muted">
            {copy.tagline}
          </AppText>
          <Badge label="In development" variant="accent" />
        </View>
      )}

      <Card style={styles.status}>
        <View style={[styles.iconTile, { backgroundColor: colors.brand }]}>
          <Icon size={24} color={colors.accent} />
        </View>
        <View style={styles.statusCopy}>
          <AppText variant="heading-2" accessibilityRole="header">
            {copy.title} is on its way
          </AppText>
          <AppText variant="body" tone="muted">
            This part of LevelUp is being built in an upcoming milestone. Nothing here is tracked
            yet. {copy.dashboardNote}
          </AppText>
        </View>
        <ButtonLink href="/" label="Back to dashboard" variant="outline" icon={ArrowLeft} />
      </Card>

      <Card variant="muted">
        <AppText variant="overline" tone="muted" accessibilityRole="header">
          Planned
        </AppText>
        <View style={styles.list}>
          {copy.plannedCapabilities.map((capability) => (
            <View key={capability} style={styles.item}>
              <View style={[styles.check, { backgroundColor: alpha(colors.primary, 0.12) }]}>
                <Check size={12} color={colors.primary} strokeWidth={3} />
              </View>
              <AppText variant="body" style={styles.itemText}>
                {capability}
              </AppText>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: { marginTop: 6 },
  stackIntro: { gap: 10, marginBottom: 4 },
  status: { gap: 18 },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statusCopy: { gap: 8 },
  list: { gap: 12, marginTop: 14 },
  item: { flexDirection: "row", gap: 12 },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  itemText: { flex: 1 },
});

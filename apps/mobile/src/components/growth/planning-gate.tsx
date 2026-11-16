import type { PlanningData } from "@levelup/types";
import { CloudOff } from "lucide-react-native";
import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { IconComponent } from "@/components/ui/icon";
import { AppText } from "@/components/ui/text";
import { usePlanning } from "@/providers/planning";
import { useTheme } from "@/theme/use-theme";

interface PlanningGateProps {
  icon: IconComponent;
  /** Rendered once the data has loaded. */
  children: (data: PlanningData) => ReactNode;
}

/**
 * Handles the states before Goals and Learning can render: no accounts on this build,
 * loading, and a failed load (with retry).
 */
export function PlanningGate({ icon, children }: PlanningGateProps) {
  const { colors } = useTheme();
  const { available, data, loadError, refresh, refreshing } = usePlanning();

  if (!available) {
    return (
      <Card>
        <EmptyState
          icon={icon}
          title="Accounts aren't set up"
          description="Your goals and learning are saved to your LevelUp account. This build has no Supabase settings, so there's nowhere to save them yet."
        />
      </Card>
    );
  }

  if (data) return children(data);

  if (loadError) {
    return (
      <Card>
        <EmptyState
          icon={CloudOff}
          title="Couldn't load your data"
          description={loadError}
          action={<Button label="Try again" loading={refreshing} onPress={() => void refresh()} />}
        />
      </Card>
    );
  }

  return (
    <View
      style={styles.loading}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      <ActivityIndicator color={colors.primary} />
      <AppText variant="body-sm" tone="muted">
        Loading…
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: "center", gap: 10, paddingVertical: 48 },
});

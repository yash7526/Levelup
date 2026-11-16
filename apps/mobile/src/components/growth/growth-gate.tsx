import type { GrowthData } from "@levelup/types";
import { CloudOff } from "lucide-react-native";
import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { IconComponent } from "@/components/ui/icon";
import { AppText } from "@/components/ui/text";
import { useGrowth } from "@/providers/growth";
import { useTheme } from "@/theme/use-theme";

interface GrowthGateProps {
  icon: IconComponent;
  /** Rendered once the data has loaded. */
  children: (data: GrowthData) => ReactNode;
}

/**
 * Handles the states before Today and Habits can render: no accounts on this build,
 * loading, and a failed load (with retry).
 */
export function GrowthGate({ icon, children }: GrowthGateProps) {
  const { colors } = useTheme();
  const { available, data, loadError, refresh, refreshing } = useGrowth();

  if (!available) {
    return (
      <Card>
        <EmptyState
          icon={icon}
          title="Accounts aren't set up"
          description="Your priorities and habits are saved to your LevelUp account. This build has no Supabase settings, so there's nowhere to save them yet."
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

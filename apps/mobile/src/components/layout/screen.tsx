import type { ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/text";
import { gutter } from "@/theme/theme";
import { useTheme } from "@/theme/use-theme";

interface ScreenProps {
  children: ReactNode;
  /**
   * `tab`: top-level tab screen without a native header (pads for the status bar).
   * `stack`: pushed screen under a native header (pads for the gesture/navigation bar).
   */
  kind?: "tab" | "stack";
  contentStyle?: ViewStyle;
  /** Enables pull-to-refresh. */
  onRefresh?: () => void;
  refreshing?: boolean;
}

/** Scrollable page with the app background, gutters and safe-area padding. */
export function Screen({
  children,
  kind = "tab",
  contentStyle,
  onRefresh,
  refreshing = false,
}: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
            progressViewOffset={kind === "tab" ? insets.top : 0}
          />
        ) : undefined
      }
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: (kind === "tab" ? insets.top : 0) + 16,
          paddingBottom: (kind === "stack" ? insets.bottom : 0) + 32,
        },
        contentStyle,
      ]}
    >
      {children}
    </ScrollView>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <View style={styles.header}>
      {eyebrow ? (
        <AppText variant="overline" tone="muted">
          {eyebrow}
        </AppText>
      ) : null}
      <AppText variant="heading-1" accessibilityRole="header">
        {title}
      </AppText>
      {description ? (
        <AppText variant="body-lg" tone="muted">
          {description}
        </AppText>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: gutter, gap: 16 },
  header: { gap: 6, marginBottom: 4 },
});

import { CircleAlert, X } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/text";
import { useTheme } from "@/theme/use-theme";

/** An inline, dismissible error for a failed save. */
export function ActionError({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={[styles.banner, { backgroundColor: colors.dangerSubtle }]}
    >
      <CircleAlert size={18} color={colors.danger} />
      <AppText variant="body-sm" tone="danger" style={styles.message}>
        {message}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        onPress={onDismiss}
        hitSlop={10}
      >
        <X size={18} color={colors.danger} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  message: { flex: 1 },
});

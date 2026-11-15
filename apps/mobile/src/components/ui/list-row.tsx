import { type Href, Link } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, type PressableProps, StyleSheet, View } from "react-native";

import { alpha } from "@/theme/theme";
import { useTheme } from "@/theme/use-theme";

import type { IconComponent } from "./icon";
import { AppText } from "./text";

interface RowContentProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  description?: string;
  icon: IconComponent;
}

/**
 * The pressable row itself. It must be a component (not a bare <Pressable>) under
 * `Link asChild`: Link merges its own style into the child, which breaks a
 * function-style `Pressable` and drops the row layout.
 */
function RowContent({ label, description, icon: Icon, ...props }: RowContentProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityHint={description}
      {...props}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.surfaceMuted : "transparent" },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: alpha(colors.primary, 0.12) }]}>
        <Icon size={18} color={colors.primary} />
      </View>
      <View style={styles.copy}>
        <AppText variant="label">{label}</AppText>
        {description ? (
          <AppText variant="caption" tone="muted">
            {description}
          </AppText>
        ) : null}
      </View>
      <ChevronRight size={18} color={colors.foregroundSubtle} />
    </Pressable>
  );
}

interface ListRowProps extends RowContentProps {
  href: Href;
}

/** A tappable navigation row with icon, label and chevron. */
export function ListRow({ href, ...props }: ListRowProps) {
  return (
    <Link href={href} asChild>
      <RowContent {...props} />
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1, gap: 2 },
});

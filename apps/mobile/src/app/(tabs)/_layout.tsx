import { Tabs } from "expo-router/js-tabs";
import { Ellipsis, House, ListChecks, Repeat, Target } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { IconComponent } from "@/components/ui/icon";
import { alpha } from "@/theme/theme";
import { useTheme } from "@/theme/use-theme";

function TabIcon({ icon: Icon, focused }: { icon: IconComponent; focused: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: focused ? alpha(colors.primary, 0.12) : "transparent" },
      ]}
    >
      <Icon size={20} color={focused ? colors.primary : colors.foregroundMuted} />
    </View>
  );
}

/** Bottom tab bar: the four most-used destinations plus "More". */
export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const tab = (title: string, icon: IconComponent) => ({
    title,
    tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon icon={icon} focused={focused} />,
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.foreground,
        tabBarInactiveTintColor: colors.foregroundMuted,
        // Room for the pill indicator + label, plus the gesture/navigation bar inset.
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 68 + insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontFamily: "Inter_600SemiBold", fontSize: 11, marginTop: 2 },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={tab("Home", House)} />
      <Tabs.Screen name="today" options={tab("Today", ListChecks)} />
      <Tabs.Screen name="habits" options={tab("Habits", Repeat)} />
      <Tabs.Screen name="goals" options={tab("Goals", Target)} />
      <Tabs.Screen name="more" options={tab("More", Ellipsis)} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  pill: { width: 52, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
});

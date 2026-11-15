import type { ThemePreference } from "@levelup/types";
import { Monitor, Moon, Sun } from "lucide-react-native";

import { usePreferences } from "@/providers/preferences";

import type { IconComponent } from "./ui/icon";
import { SegmentedControl } from "./ui/segmented-control";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const satisfies readonly { value: ThemePreference; label: string; icon: IconComponent }[];

export function ThemeSwitcher() {
  const { themePreference, setThemePreference } = usePreferences();
  return (
    <SegmentedControl
      label="Theme"
      options={options}
      value={themePreference}
      onChange={setThemePreference}
    />
  );
}

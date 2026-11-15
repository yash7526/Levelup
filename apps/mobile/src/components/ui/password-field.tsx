import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Pressable } from "react-native";

import { useTheme } from "@/theme/use-theme";

import { TextField, type TextFieldProps } from "./text-field";

/** Password input with a show/hide toggle. */
export function PasswordField(props: Omit<TextFieldProps, "secureTextEntry" | "accessory">) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <TextField
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
      secureTextEntry={!visible}
      accessory={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? "Hide password" : "Show password"}
          accessibilityState={{ selected: visible }}
          onPress={() => setVisible((value) => !value)}
          hitSlop={8}
          style={{ padding: 8 }}
        >
          <Icon size={18} color={colors.foregroundSubtle} />
        </Pressable>
      }
    />
  );
}

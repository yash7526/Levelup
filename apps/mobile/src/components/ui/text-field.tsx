import { CircleAlert } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, TextInput, type TextInputProps, View } from "react-native";

import { alpha } from "@/theme/theme";
import { useTheme } from "@/theme/use-theme";

import { AppText } from "./text";

interface TextFieldProps extends Omit<TextInputProps, "style"> {
  label: string;
  hint?: string;
  error?: string;
}

/** Label + input + hint + error, exposed to screen readers as one labelled field. */
export function TextField({
  label,
  hint,
  error,
  editable = true,
  onFocus,
  onBlur,
  ...props
}: TextFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.ring : colors.borderStrong;

  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        editable={editable}
        placeholderTextColor={colors.foregroundSubtle}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        {...props}
        style={[
          styles.input,
          {
            borderColor,
            color: colors.foreground,
            backgroundColor: editable ? colors.surface : colors.surfaceMuted,
          },
          focused && {
            boxShadow: `0 0 0 4px ${alpha(error ? colors.danger : colors.ring, 0.15)}`,
          },
        ]}
      />
      {hint && !error ? (
        <AppText variant="body-sm" tone="muted">
          {hint}
        </AppText>
      ) : null}
      {error ? (
        <View style={styles.error} accessibilityLiveRegion="polite">
          <CircleAlert size={16} color={colors.danger} />
          <AppText variant="body-sm" tone="danger" style={styles.errorText}>
            {error}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 16,
  },
  error: { flexDirection: "row", alignItems: "center", gap: 6 },
  errorText: { flex: 1 },
});

import { CircleAlert, CircleCheck } from "lucide-react-native";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Logo } from "@/components/logo";
import { Card } from "@/components/ui/card";
import { AppText } from "@/components/ui/text";
import { gutter } from "@/theme/theme";
import { useTheme } from "@/theme/use-theme";

interface AuthScreenProps {
  title: string;
  description: ReactNode;
  children: ReactNode;
  /** Secondary links under the card. */
  footer?: ReactNode;
}

/** Centered, keyboard-aware frame for sign-in, sign-up and recovery screens. */
export function AuthScreen({ title, description, children, footer }: AuthScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 },
        ]}
      >
        <View style={styles.logo}>
          <Logo />
        </View>
        <Card style={styles.card}>
          <AppText variant="heading-1" accessibilityRole="header">
            {title}
          </AppText>
          <AppText variant="body" tone="muted" style={styles.description}>
            {description}
          </AppText>
          <View style={styles.body}>{children}</View>
        </Card>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Form-level error or confirmation, announced to screen readers when it appears. */
export function FormMessage({ error, notice }: { error?: string; notice?: string }) {
  const { colors } = useTheme();
  if (!error && !notice) return null;
  const isError = Boolean(error);
  const Icon = isError ? CircleAlert : CircleCheck;
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole={isError ? "alert" : "text"}
      style={[
        styles.message,
        { backgroundColor: isError ? colors.dangerSubtle : colors.successSubtle },
      ]}
    >
      <Icon size={16} color={isError ? colors.danger : colors.success} />
      <AppText variant="body-sm" tone={isError ? "danger" : "success"} style={styles.messageText}>
        {error ?? notice}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: gutter,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  logo: { alignItems: "center", marginBottom: 28 },
  card: { padding: 24 },
  description: { marginTop: 8 },
  body: { marginTop: 24, gap: 16 },
  footer: { marginTop: 24, gap: 10, alignItems: "center" },
  message: {
    flexDirection: "row",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  messageText: { flex: 1 },
});

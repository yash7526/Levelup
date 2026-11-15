import { type Href, Link } from "expo-router";
import type { ReactNode } from "react";
import { StyleSheet } from "react-native";

import { useTheme } from "@/theme/use-theme";

/** Underlined inline link for auth footers (nest inside AppText for sentences). */
export function TextLink({ href, children }: { href: Href; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <Link href={href} style={[styles.link, { color: colors.foreground }]}>
      {children}
    </Link>
  );
}

const styles = StyleSheet.create({
  link: { fontFamily: "Inter_500Medium", textDecorationLine: "underline" },
});

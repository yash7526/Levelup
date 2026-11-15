import type { Href } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { SampleBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, type CardVariant } from "@/components/ui/card";
import { AppText } from "@/components/ui/text";

interface DashboardCardProps {
  title: string;
  description?: string;
  isDemo?: boolean;
  /** Header-level element such as a status badge. */
  badge?: ReactNode;
  /** Link to the module, shown at the bottom of the card when there is content. */
  footerLink?: { href: Href; label: string };
  variant?: CardVariant;
  children: ReactNode;
}

/** Consistent frame for dashboard sections, with the sample label when needed. */
export function DashboardCard({
  title,
  description,
  isDemo = false,
  badge,
  footerLink,
  variant,
  children,
}: DashboardCardProps) {
  const onBrand = variant === "brand";
  return (
    <Card variant={variant}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <AppText
            variant="heading-3"
            tone={onBrand ? "onBrand" : "default"}
            accessibilityRole="header"
          >
            {title}
          </AppText>
          {description ? (
            <AppText variant="body-sm" tone={onBrand ? "onBrandMuted" : "muted"}>
              {description}
            </AppText>
          ) : null}
        </View>
        {isDemo ? <SampleBadge /> : badge}
      </View>
      {children}
      {footerLink ? (
        <ButtonLink
          href={footerLink.href}
          label={footerLink.label}
          variant="ghost"
          size="sm"
          icon={ArrowRight}
          iconPosition="end"
          style={styles.footerLink}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  headerCopy: { flex: 1, gap: 2 },
  footerLink: { marginTop: 12, marginLeft: -12 },
});

import "./globals.css";

import { colors } from "@levelup/tokens";
import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";

import { themeInitScript } from "@/components/theme/theme-script";
import { cn } from "@/lib/cn";
import { siteUrl } from "@/lib/env";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "LevelUp", template: "%s · LevelUp" },
  description:
    "LevelUp is a personal growth platform for building habits, reaching goals and learning every day.",
  applicationName: "LevelUp",
  appleWebApp: { title: "LevelUp", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: colors.light.background },
    { media: "(prefers-color-scheme: dark)", color: colors.dark.background },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The theme script sets `class`/`style` on <html> before hydration.
    <html lang="en" className={cn(inter.variable, manrope.variable)} suppressHydrationWarning>
      <head>
        {/*
          A plain inline script (not next/script, which defers inline code until the
          runtime loads) so the theme is applied during HTML parsing, before first paint.
        */}
        <script id="levelup-theme-init" dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}

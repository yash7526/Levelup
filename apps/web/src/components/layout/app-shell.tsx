import type { Viewer } from "@levelup/types";
import type { ReactNode } from "react";

import { BottomNav } from "@/components/navigation/bottom-nav";
import { MobileHeader } from "@/components/navigation/mobile-header";
import { Sidebar } from "@/components/navigation/sidebar";

/**
 * Responsive application frame:
 * - < lg: sticky top bar + bottom tab bar (thumb-reachable)
 * - ≥ lg: fixed sidebar
 */
export function AppShell({ viewer, children }: { viewer: Viewer; children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:pl-(--lu-sidebar-width)">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-label text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Sidebar viewer={viewer} />
      <MobileHeader viewer={viewer} />
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-(--lu-content-max-width) px-4 pt-5 pb-[calc(var(--lu-bottom-nav-height)+env(safe-area-inset-bottom)+2rem)] outline-none sm:px-6 sm:pt-8 lg:px-10 lg:pt-10 lg:pb-16"
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

import type { Viewer } from "@levelup/types";
import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Logo } from "@/components/layout/logo";
import { ViewerAvatar } from "@/components/layout/viewer-avatar";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";

import { SidebarMainNav, SidebarSettingsLink } from "./sidebar-nav";

/** Desktop navigation (≥ lg). */
export function Sidebar({ viewer }: { viewer: Viewer }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-(--lu-sidebar-width) flex-col border-r border-border bg-surface/70 backdrop-blur-xl lg:flex">
      <div className="flex h-20 shrink-0 items-center px-6">
        <Link
          href="/dashboard"
          aria-label="LevelUp — go to dashboard"
          className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-surface"
        >
          <Logo />
        </Link>
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 pb-4">
        <SidebarMainNav />
      </nav>

      <div className="grid gap-3 border-t border-border p-3">
        <SidebarSettingsLink />
        <ThemeSwitcher compact className="px-1" />
        <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
          <ViewerAvatar name={viewer.displayName} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-label text-foreground">
              {viewer.displayName ?? (viewer.isAuthenticated ? "Your account" : "Guest")}
            </p>
            <p className="truncate text-caption text-foreground-muted">
              {viewer.isAuthenticated ? (viewer.email ?? "Signed in") : "Not signed in"}
            </p>
          </div>
          {viewer.isAuthenticated ? <SignOutButton iconOnly /> : null}
        </div>
      </div>
    </aside>
  );
}

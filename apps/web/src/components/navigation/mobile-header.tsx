import type { Viewer } from "@levelup/types";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { ViewerAvatar } from "@/components/layout/viewer-avatar";

/** Top bar for small screens (< lg). */
export function MobileHeader({ viewer }: { viewer: Viewer }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl lg:hidden">
      <div className="flex h-(--lu-mobile-header-height) items-center justify-between px-4 sm:px-6">
        <Link
          href="/dashboard"
          aria-label="LevelUp — go to dashboard"
          className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo />
        </Link>
        <Link
          href="/settings"
          aria-label="Profile and settings"
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ViewerAvatar name={viewer.displayName} />
        </Link>
      </div>
    </header>
  );
}

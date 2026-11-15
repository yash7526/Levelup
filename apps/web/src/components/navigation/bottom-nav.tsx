"use client";

import { Ellipsis, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";

import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";

import { isActivePath, mobileMoreItems, mobileTabs } from "./nav-items";
import { SidebarLink } from "./sidebar-link";

const tabClass = cn(
  "flex h-full w-full flex-col items-center justify-center gap-1 text-caption outline-none",
  "focus-visible:[&>span]:ring-2 focus-visible:[&>span]:ring-ring",
);

function TabIcon({ icon: Icon, active }: { icon: LucideIcon; active: boolean }) {
  return (
    <span
      className={cn(
        "grid h-8 w-14 place-items-center rounded-full transition-colors duration-200",
        active ? "bg-primary/12 text-primary" : "text-foreground-muted",
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
    </span>
  );
}

/** Bottom tab bar for small screens (< lg) with a "More" sheet for the remaining destinations. */
export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const closeMore = useCallback(() => setMoreOpen(false), []);
  const moreActive = mobileMoreItems.some((item) => isActivePath(pathname, item.href));

  return (
    <>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      >
        <ul className="mx-auto grid h-(--lu-bottom-nav-height) max-w-xl grid-cols-5 px-1">
          {mobileTabs.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    tabClass,
                    active ? "font-semibold text-foreground" : "text-foreground-muted",
                  )}
                >
                  <TabIcon icon={item.icon} active={active} />
                  {item.shortLabel ?? item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              className={cn(
                tabClass,
                moreActive ? "font-semibold text-foreground" : "text-foreground-muted",
              )}
            >
              <TabIcon icon={Ellipsis} active={moreActive} />
              More
            </button>
          </li>
        </ul>
      </nav>

      <Modal open={moreOpen} onClose={closeMore} title="More" variant="sheet" size="sm">
        <nav aria-label="More destinations">
          <ul className="grid gap-1">
            {mobileMoreItems.map((item) => (
              <li key={item.href}>
                <SidebarLink item={item} onNavigate={closeMore} className="h-12" />
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-5 border-t border-border pt-5">
          <ThemeSwitcher />
        </div>
      </Modal>
    </>
  );
}

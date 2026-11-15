"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

import { isActivePath, type NavItem } from "./nav-items";

interface SidebarLinkProps {
  item: NavItem;
  onNavigate?: () => void;
  className?: string;
}

export function SidebarLink({ item, onNavigate, className }: SidebarLinkProps) {
  const pathname = usePathname();
  const active = isActivePath(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex h-11 items-center gap-3 rounded-xl px-3 text-label transition-colors duration-150",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-brand font-semibold text-brand-foreground"
          : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
        className,
      )}
    >
      <Icon
        className={cn(
          "size-[1.125rem] shrink-0 transition-colors",
          active ? "text-accent" : "text-foreground-subtle group-hover:text-foreground",
        )}
        aria-hidden="true"
      />
      {item.label}
    </Link>
  );
}

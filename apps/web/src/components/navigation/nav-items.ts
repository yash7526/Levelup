import {
  GraduationCap,
  House,
  ListChecks,
  type LucideIcon,
  Repeat,
  Settings,
  Sparkles,
  Target,
} from "lucide-react";
import type { Route } from "next";

export interface NavItem {
  href: Route;
  label: string;
  /** Shorter label for the mobile tab bar. */
  shortLabel?: string;
  icon: LucideIcon;
}

/** Single source of truth for app navigation (sidebar, tab bar and "More" sheet). */
export const mainNav = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: House },
  { href: "/today", label: "Today", icon: ListChecks },
  { href: "/habits", label: "Habits", icon: Repeat },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/learning", label: "Learning", icon: GraduationCap },
  { href: "/coach", label: "AI Coach", icon: Sparkles },
] as const satisfies readonly NavItem[];

export const settingsNav = {
  href: "/settings",
  label: "Settings",
  icon: Settings,
} as const satisfies NavItem;

/** Destinations shown directly in the mobile tab bar; the rest live under "More". */
export const mobileTabs: readonly NavItem[] = mainNav.slice(0, 4);
export const mobileMoreItems: readonly NavItem[] = [...mainNav.slice(4), settingsNav];

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

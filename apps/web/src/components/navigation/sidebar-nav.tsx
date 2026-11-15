"use client";

import { mainNav, settingsNav } from "./nav-items";
import { SidebarLink } from "./sidebar-link";

/*
 * Nav items carry icon components, which cannot be passed from Server to Client
 * Components as props. These client wrappers import the config directly instead.
 */

export function SidebarMainNav() {
  return (
    <ul className="grid gap-1">
      {mainNav.map((item) => (
        <li key={item.href}>
          <SidebarLink item={item} />
        </li>
      ))}
    </ul>
  );
}

export function SidebarSettingsLink() {
  return <SidebarLink item={settingsNav} />;
}

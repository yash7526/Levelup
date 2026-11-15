"use client";

import type { ThemePreference } from "@levelup/types";
import { Monitor, Moon, Sun } from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/cn";

import { setThemePreference, useThemePreference } from "./use-theme";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const satisfies readonly { value: ThemePreference; label: string; icon: unknown }[];

interface ThemeSwitcherProps {
  /** Icon-only segmented control for tight spaces such as the sidebar. */
  compact?: boolean;
  className?: string;
}

/** Native radio group styled as a segmented control: keyboard and screen-reader friendly. */
export function ThemeSwitcher({ compact = false, className }: ThemeSwitcherProps) {
  const preference = useThemePreference();
  const name = useId();

  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className={compact ? "sr-only" : "mb-2 text-label text-foreground"}>Theme</legend>
      <div className="grid grid-cols-3 gap-1 rounded-full bg-surface-muted p-1">
        {options.map(({ value, label, icon: Icon }) => (
          <label
            key={value}
            title={compact ? label : undefined}
            className={cn(
              "flex cursor-pointer items-center justify-center gap-2 rounded-full text-body-sm font-medium text-foreground-muted transition-[background-color,color,box-shadow] duration-150 select-none hover:text-foreground",
              "has-checked:bg-surface has-checked:text-foreground has-checked:shadow-card",
              "has-focus-visible:ring-2 has-focus-visible:ring-ring",
              compact ? "h-8" : "h-10",
            )}
          >
            <input
              type="radio"
              name={name}
              value={value}
              checked={preference === value}
              onChange={() => setThemePreference(value)}
              className="sr-only"
            />
            <Icon className="size-4" aria-hidden="true" />
            <span className={compact ? "sr-only" : undefined}>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

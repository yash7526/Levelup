import { textStyles } from "@levelup/tokens";
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge needs to know about LevelUp's custom type scale and shadows,
 * otherwise `text-heading-2 text-foreground` would be treated as a conflict.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: Object.keys(textStyles) }],
      shadow: [{ shadow: ["card", "raised", "floating"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

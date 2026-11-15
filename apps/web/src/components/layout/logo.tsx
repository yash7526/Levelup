import { cn } from "@/lib/cn";

/** LevelUp mark: ascending steps on the forest tile. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8 shrink-0", className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" className="fill-forest-700" />
      <path
        d="M9 22h4.5v-4.5H18V13h4.5V9"
        fill="none"
        className="stroke-lime-300"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-[1.1875rem] font-extrabold tracking-tight text-foreground">
        LevelUp
      </span>
    </span>
  );
}

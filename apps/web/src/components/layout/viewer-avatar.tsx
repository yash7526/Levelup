import { getInitials } from "@levelup/utils";
import { User } from "lucide-react";

import { cn } from "@/lib/cn";

export function ViewerAvatar({ name, className }: { name: string | null; className?: string }) {
  const initials = getInitials(name);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full bg-accent font-display text-label font-bold text-accent-foreground",
        className,
      )}
    >
      {initials || <User className="size-4" />}
    </span>
  );
}

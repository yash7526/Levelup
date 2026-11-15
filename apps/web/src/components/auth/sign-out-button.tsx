import { LogOut } from "lucide-react";

import { signOut } from "@/app/(auth)/actions";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";

interface SignOutButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Compact icon button (accessible name and tooltip "Sign out"). */
  iconOnly?: boolean;
  className?: string;
}

/** Posts to the sign-out Server Action, so it works even before JavaScript loads. */
export function SignOutButton({
  variant = "outline",
  size = "sm",
  iconOnly = false,
  className,
}: SignOutButtonProps) {
  return (
    <form action={signOut} className={iconOnly ? "contents" : undefined}>
      <Button
        type="submit"
        variant={iconOnly ? "ghost" : variant}
        size={iconOnly ? "icon-sm" : size}
        aria-label={iconOnly ? "Sign out" : undefined}
        title={iconOnly ? "Sign out" : undefined}
        className={className}
      >
        <LogOut aria-hidden="true" />
        {iconOnly ? null : "Sign out"}
      </Button>
    </form>
  );
}

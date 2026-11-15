import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description: ReactNode;
  children: ReactNode;
  /** Secondary links under the card, e.g. "New to LevelUp? Create an account". */
  footer?: ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <>
      <Card className="p-6 sm:p-8">
        <h1 className="font-display text-heading-1">{title}</h1>
        <p className="mt-2 text-body text-foreground-muted">{description}</p>
        <div className="mt-6">{children}</div>
      </Card>
      {footer ? (
        <div className="mt-6 grid gap-2 text-center text-body-sm text-foreground-muted">
          {footer}
        </div>
      ) : null}
    </>
  );
}

/** Inline text link styled for auth footers. */
export const authLinkClass =
  "font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-foreground";

import { ArrowRight } from "lucide-react";
import type { Route } from "next";

import { ButtonLink } from "@/components/ui/button";

export function ViewAllLink<T extends string>({ href, label }: { href: Route<T>; label: string }) {
  return (
    <ButtonLink href={href} variant="ghost" size="sm" className="-mr-2 text-foreground-muted">
      {label}
      <ArrowRight aria-hidden="true" />
    </ButtonLink>
  );
}

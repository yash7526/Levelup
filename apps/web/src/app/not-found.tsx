import { Compass } from "lucide-react";
import type { Metadata } from "next";

import { Logo } from "@/components/layout/logo";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="flex max-w-md flex-col items-center text-center">
        <Logo className="mb-10" />
        <span className="grid size-14 place-items-center rounded-2xl bg-surface-muted text-foreground-muted">
          <Compass className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-6 text-overline text-foreground-muted uppercase">Error 404</p>
        <h1 className="mt-2 font-display text-heading-1">This page doesn&apos;t exist</h1>
        <p className="mt-3 text-body-lg text-foreground-muted">
          The link may be broken, or the page may have moved.
        </p>
        <ButtonLink href="/dashboard" className="mt-8">
          Back to dashboard
        </ButtonLink>
      </div>
    </main>
  );
}

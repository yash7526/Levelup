import { KeyRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/layout/logo";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { isAuthEnabled } from "@/lib/viewer";

/** Centered, distraction-free frame for sign-in, sign-up and recovery pages. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center px-4 pt-[max(2.5rem,env(safe-area-inset-top))] pb-10 sm:justify-center sm:py-16">
      <div className="w-full max-w-md">
        <Link
          href="/"
          aria-label="LevelUp home"
          className="mx-auto mb-8 flex w-fit rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo />
        </Link>
        {isAuthEnabled() ? (
          children
        ) : (
          <Card>
            <EmptyState
              icon={KeyRound}
              title="Accounts aren't set up here"
              description="This environment has no Supabase project configured, so LevelUp runs without sign-in. Add the Supabase settings to apps/web/.env.local to enable accounts."
              action={<ButtonLink href="/dashboard">Continue to dashboard</ButtonLink>}
            />
          </Card>
        )}
      </div>
    </main>
  );
}

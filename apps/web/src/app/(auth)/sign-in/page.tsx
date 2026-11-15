import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard, authLinkClass } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/forms";
import { safeNextPath } from "@/lib/auth/routes";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const { next } = await searchParams;
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to pick up where you left off."
      footer={
        <>
          <p>
            <Link href="/forgot-password" className={authLinkClass}>
              Forgot your password?
            </Link>
          </p>
          <p>
            New to LevelUp?{" "}
            <Link href="/sign-up" className={authLinkClass}>
              Create an account
            </Link>
          </p>
        </>
      }
    >
      <SignInForm next={safeNextPath(next) ?? undefined} />
    </AuthCard>
  );
}

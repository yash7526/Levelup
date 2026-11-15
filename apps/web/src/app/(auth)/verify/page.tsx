import { normalizeEmail, validateEmail } from "@levelup/supabase";
import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard, authLinkClass } from "@/components/auth/auth-card";
import { VerifyEmailForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Confirm your email" };

export default async function VerifyPage({ searchParams }: PageProps<"/verify">) {
  const { email: rawEmail, resent } = await searchParams;
  const candidate = typeof rawEmail === "string" ? normalizeEmail(rawEmail) : "";
  const email = candidate && !validateEmail(candidate) ? candidate : undefined;

  return (
    <AuthCard
      title="Check your email"
      description={
        email ? (
          <>
            We sent a confirmation code to <strong className="text-foreground">{email}</strong>.
            Enter it below to finish creating your account.
          </>
        ) : (
          "Enter your email and the confirmation code we sent you."
        )
      }
      footer={
        <>
          <p>Can&apos;t find it? Check your spam folder — it can take a minute to arrive.</p>
          <p>
            Wrong email?{" "}
            <Link href="/sign-up" className={authLinkClass}>
              Start again
            </Link>
          </p>
        </>
      }
    >
      <VerifyEmailForm email={email} resent={resent === "1"} />
    </AuthCard>
  );
}

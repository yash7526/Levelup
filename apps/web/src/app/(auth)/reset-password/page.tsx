import { normalizeEmail, validateEmail } from "@levelup/supabase";
import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard, authLinkClass } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Set a new password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { email: rawEmail } = await searchParams;
  const candidate = typeof rawEmail === "string" ? normalizeEmail(rawEmail) : "";
  const email = candidate && !validateEmail(candidate) ? candidate : undefined;

  return (
    <AuthCard
      title="Set a new password"
      description={
        email ? (
          <>
            If <strong className="text-foreground">{email}</strong> has a LevelUp account,
            we&apos;ve sent it a code. Enter the code and choose a new password.
          </>
        ) : (
          "Enter your email, the code we sent you and a new password."
        )
      }
      footer={
        <p>
          <Link href="/sign-in" className={authLinkClass}>
            Back to sign in
          </Link>
        </p>
      }
    >
      <ResetPasswordForm email={email} />
    </AuthCard>
  );
}

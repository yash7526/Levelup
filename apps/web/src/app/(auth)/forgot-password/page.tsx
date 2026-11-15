import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard, authLinkClass } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter your account email and we'll send you a code to set a new password."
      footer={
        <p>
          Remembered it?{" "}
          <Link href="/sign-in" className={authLinkClass}>
            Back to sign in
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}

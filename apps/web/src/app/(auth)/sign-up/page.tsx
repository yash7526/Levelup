import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard, authLinkClass } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Build habits, reach goals and keep learning — one day at a time."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/sign-in" className={authLinkClass}>
            Sign in
          </Link>
        </p>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}

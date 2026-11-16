import { ArrowLeft, type LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

interface AccountRequiredProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Shown in place of Today and Habits when accounts (Supabase) aren't configured. */
export function AccountRequired({ icon, title, description }: AccountRequiredProps) {
  return (
    <div className="grid gap-6 lg:gap-8">
      <PageHeader title={title} description={description} />
      <Card>
        <EmptyState
          icon={icon}
          title="Accounts aren't set up yet"
          description="Your priorities and habits are saved to your LevelUp account. Add the Supabase settings described in the README, then sign in to start tracking."
          action={
            <ButtonLink href="/dashboard" variant="outline" size="sm">
              <ArrowLeft aria-hidden="true" />
              Back to dashboard
            </ButtonLink>
          }
        />
      </Card>
    </div>
  );
}

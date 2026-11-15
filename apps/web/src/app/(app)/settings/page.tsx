import { describeSupabaseProject } from "@levelup/supabase";
import { ArrowRight, Database, Palette } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { PreferredNameForm } from "@/components/settings/preferred-name-form";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const viewer = await getViewer();
  const supabase = getSupabaseConfig();

  return (
    <div className="grid gap-6 lg:gap-8">
      <PageHeader title="Settings" description="Make LevelUp look and feel like yours." />

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        <Card as="section" id="profile" aria-labelledby="profile-title" className="scroll-mt-24">
          <CardHeader>
            <div>
              <CardTitle id="profile-title">Profile</CardTitle>
              <CardDescription>How LevelUp greets you</CardDescription>
            </div>
          </CardHeader>
          <PreferredNameForm currentName={viewer.displayName} />
        </Card>

        <Card
          as="section"
          id="appearance"
          aria-labelledby="appearance-title"
          className="scroll-mt-24"
        >
          <CardHeader>
            <div>
              <CardTitle id="appearance-title">Appearance</CardTitle>
              <CardDescription>Choose a theme, or follow your device setting</CardDescription>
            </div>
          </CardHeader>
          <ThemeSwitcher />
        </Card>

        <Card as="section" aria-labelledby="backend-title">
          <CardHeader>
            <div>
              <CardTitle id="backend-title">Account &amp; sync</CardTitle>
              <CardDescription>Backend connection for this environment</CardDescription>
            </div>
            <Database className="size-5 text-foreground-subtle" aria-hidden="true" />
          </CardHeader>
          <dl className="grid gap-3 text-body-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-foreground-muted">Supabase</dt>
              <dd>
                {supabase ? (
                  <Badge variant="success">Connected to {describeSupabaseProject(supabase)}</Badge>
                ) : (
                  <Badge variant="outline">Not configured</Badge>
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-foreground-muted">Session</dt>
              <dd className="text-foreground">
                {viewer.isAuthenticated ? "Signed in" : "Not signed in"}
              </dd>
            </div>
          </dl>
          {!supabase ? (
            <p className="mt-4 rounded-xl bg-surface-muted p-3 text-body-sm text-foreground-muted">
              Add <code className="font-mono text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="font-mono text-foreground">
                NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
              </code>{" "}
              to <code className="font-mono text-foreground">apps/web/.env.local</code>, then
              restart the dev server. Sign-in arrives with the accounts milestone.
            </p>
          ) : null}
        </Card>

        <Card as="section" aria-labelledby="design-title">
          <CardHeader>
            <div>
              <CardTitle id="design-title">Design system</CardTitle>
              <CardDescription>Tokens and components that make up LevelUp</CardDescription>
            </div>
            <Palette className="size-5 text-foreground-subtle" aria-hidden="true" />
          </CardHeader>
          <p className="text-body-sm text-foreground-muted">
            Colours, typography, buttons, inputs, cards, progress, badges and dialogs, shown in the
            current theme.
          </p>
          <ButtonLink href="/design-system" variant="outline" size="sm" className="mt-4">
            Open design system
            <ArrowRight aria-hidden="true" />
          </ButtonLink>
        </Card>
      </div>
    </div>
  );
}

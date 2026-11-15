import { colorRoles, colors, colorVar, type TextStyleName, textStyles } from "@levelup/tokens";
import { ArrowRight, Plus, Repeat } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ModalDemo } from "@/components/design-system/modal-demo";
import { PageHeader } from "@/components/layout/page-header";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TextField } from "@/components/ui/input";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Design system" };

/** Literal class names so Tailwind generates every step of the type scale. */
const typeClasses: Record<TextStyleName, string> = {
  display: "text-display",
  "heading-1": "text-heading-1",
  "heading-2": "text-heading-2",
  "heading-3": "text-heading-3",
  "body-lg": "text-body-lg",
  body: "text-body",
  "body-sm": "text-body-sm",
  label: "text-label",
  caption: "text-caption",
  overline: "text-overline",
};

const buttonVariants: ButtonVariant[] = [
  "primary",
  "secondary",
  "outline",
  "ghost",
  "accent",
  "danger",
];
const badgeVariants: BadgeVariant[] = [
  "neutral",
  "primary",
  "accent",
  "success",
  "warning",
  "danger",
  "outline",
  "sample",
];

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-title`} className="grid gap-4">
      <div>
        <h2 id={`${id}-title`} className="font-display text-heading-2">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-body-sm text-foreground-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function toLabel(role: string): string {
  return role.replace(/[A-Z]/g, (match) => ` ${match.toLowerCase()}`);
}

export default function DesignSystemPage() {
  return (
    <div className="grid gap-10 lg:gap-12">
      <PageHeader
        eyebrow="Reference"
        title="Design system"
        description="LevelUp's tokens and components, rendered live in the current theme. Values come from @levelup/tokens."
        actions={<ThemeSwitcher compact className="w-40" />}
      />

      <Section
        id="colours"
        title="Colour roles"
        description="Components use semantic roles. Each role has a light and a dark value."
      >
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {colorRoles.map((role) => (
            <li key={role} className="overflow-hidden rounded-xl border border-border bg-surface">
              <div
                className="h-14 border-b border-border"
                style={{ backgroundColor: `var(${colorVar(role)})` }}
              />
              <div className="p-3">
                <p className="truncate text-label text-foreground capitalize">{toLabel(role)}</p>
                <p className="mt-0.5 truncate font-mono text-caption text-foreground-muted">
                  {colors.light[role]} / {colors.dark[role]}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="typography"
        title="Typography"
        description="Manrope for display and headings, Inter for interface and body text."
      >
        <Card className="grid gap-5">
          {Object.entries(textStyles).map(([name, style]) => (
            <div
              key={name}
              className="grid gap-1 border-b border-border pb-5 last:border-0 last:pb-0 sm:grid-cols-[10rem_1fr] sm:items-baseline sm:gap-6"
            >
              <p className="font-mono text-caption text-foreground-muted">
                {name} · {style.size}/{style.lineHeight}
              </p>
              <p
                className={cn(
                  typeClasses[name as TextStyleName],
                  style.family === "display" ? "font-display" : "font-sans",
                  "uppercase" in style && "uppercase",
                )}
              >
                Build the life you want, one day at a time
              </p>
            </div>
          ))}
        </Card>
      </Section>

      <Section id="buttons" title="Buttons" description="Pill-shaped, 44px default touch target.">
        <Card className="grid gap-5">
          <div className="flex flex-wrap gap-3">
            {buttonVariants.map((variant) => (
              <Button key={variant} variant={variant} className="capitalize">
                {variant}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" variant="outline" aria-label="Add">
              <Plus aria-hidden="true" />
            </Button>
            <Button loading>Saving</Button>
            <Button disabled>Disabled</Button>
            <Button variant="accent">
              Continue
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </Card>
      </Section>

      <Section id="inputs" title="Inputs">
        <Card className="grid gap-5 md:grid-cols-3">
          <TextField id="ds-input-default" label="Default" placeholder="Placeholder" />
          <TextField
            id="ds-input-hint"
            label="With hint"
            defaultValue="Morning pages"
            hint="Helpful guidance sits below the field."
          />
          <TextField
            id="ds-input-error"
            label="With error"
            defaultValue="x"
            error="Use at least two characters."
          />
          <TextField id="ds-input-disabled" label="Disabled" defaultValue="Read only" disabled />
        </Card>
      </Section>

      <Section id="cards" title="Cards">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardTitle as="h3">Default</CardTitle>
            <CardDescription>Surface with hairline border and soft shadow.</CardDescription>
          </Card>
          <Card variant="muted">
            <CardTitle as="h3">Muted</CardTitle>
            <CardDescription>For secondary groupings.</CardDescription>
          </Card>
          <Card variant="outline">
            <CardTitle as="h3">Outline</CardTitle>
            <CardDescription>Minimal, no fill.</CardDescription>
          </Card>
          <Card variant="brand">
            <CardTitle as="h3">Brand</CardTitle>
            <CardDescription className="text-brand-muted">
              Reserved for hero moments.
            </CardDescription>
          </Card>
        </div>
      </Section>

      <Section id="progress" title="Progress" description="Tracks are a tint of the fill colour.">
        <Card className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div className="grid gap-4">
            <ProgressBar value={0} label="Example progress, 0%" />
            <ProgressBar value={40} label="Example progress, 40%" />
            <ProgressBar value={100} label="Example progress, 100%" tone="success" />
            <ProgressBar value={65} label="Example progress, 65%, small" size="sm" />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <ProgressRing value={0} label="Example ring, 0%" size={88} strokeWidth={8}>
              <span className="text-label font-semibold">0%</span>
            </ProgressRing>
            <ProgressRing value={62} label="Example ring, 62%" size={88} strokeWidth={8}>
              <span className="text-label font-semibold">62%</span>
            </ProgressRing>
            <div className="rounded-2xl bg-brand p-3">
              <ProgressRing
                value={80}
                label="Example ring on brand, 80%"
                size={88}
                strokeWidth={8}
                tone="onBrand"
              >
                <span className="text-label font-semibold text-brand-foreground">80%</span>
              </ProgressRing>
            </div>
          </div>
        </Card>
      </Section>

      <Section id="badges" title="Badges">
        <Card className="flex flex-wrap gap-2">
          {badgeVariants.map((variant) => (
            <Badge key={variant} variant={variant} className="capitalize">
              {variant}
            </Badge>
          ))}
        </Card>
      </Section>

      <Section id="feedback" title="Empty states & loading">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <EmptyState
              icon={Repeat}
              title="No habits yet"
              description="Empty states explain what belongs here and offer one real next step."
            />
          </Card>
          <Card className="grid content-center gap-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </Card>
        </div>
      </Section>

      <Section
        id="dialogs"
        title="Dialogs"
        description="Built on the native <dialog> element: focus trap, Escape and backdrop dismissal."
      >
        <Card>
          <ModalDemo />
        </Card>
      </Section>
    </div>
  );
}

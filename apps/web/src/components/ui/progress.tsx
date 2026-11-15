import { clamp } from "@levelup/utils";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * `onBrand` is for progress drawn on the forest brand surface.
 * Tracks are a light tint of the fill hue (not grey) so state reads across the whole bar.
 */
export type ProgressTone = "primary" | "accent" | "success" | "onBrand";

const barTones: Record<ProgressTone, { track: string; fill: string }> = {
  primary: { track: "bg-primary/12", fill: "bg-primary" },
  accent: { track: "bg-accent/30", fill: "bg-accent" },
  success: { track: "bg-success/15", fill: "bg-success" },
  onBrand: { track: "bg-brand-foreground/15", fill: "bg-accent" },
};

const ringTones: Record<ProgressTone, { track: string; fill: string }> = {
  primary: { track: "stroke-primary/12", fill: "stroke-primary" },
  accent: { track: "stroke-accent/30", fill: "stroke-accent" },
  success: { track: "stroke-success/15", fill: "stroke-success" },
  onBrand: { track: "stroke-brand-foreground/15", fill: "stroke-accent" },
};

function toPercent(value: number, max: number): number {
  return max > 0 ? clamp((value / max) * 100, 0, 100) : 0;
}

interface ProgressBarProps {
  value: number;
  max?: number;
  /** Accessible name, e.g. "Run a half marathon progress". */
  label: string;
  /** Spoken value, e.g. "3 of 8 milestones". */
  valueText?: string;
  tone?: ProgressTone;
  size?: "sm" | "md";
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  valueText,
  tone = "primary",
  size = "md",
  className,
}: ProgressBarProps) {
  const percent = toPercent(value, max);
  const { track, fill } = barTones[tone];

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      className={cn(
        "w-full overflow-hidden rounded-full",
        size === "sm" ? "h-1.5" : "h-2",
        track,
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-emphasized",
          fill,
          percent === 0 && "hidden",
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

interface ProgressRingProps {
  value: number;
  max?: number;
  label: string;
  valueText?: string;
  tone?: ProgressTone;
  /** Diameter in px. */
  size?: number;
  strokeWidth?: number;
  /** Content centred inside the ring, typically the headline figure. */
  children?: ReactNode;
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  label,
  valueText,
  tone = "primary",
  size = 128,
  strokeWidth = 10,
  children,
  className,
}: ProgressRingProps) {
  const percent = toPercent(value, max);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);
  const { track, fill } = ringTones[tone];

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      className={cn("relative inline-grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={track}
        />
        {percent > 0 ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(fill, "transition-[stroke-dashoffset] duration-700 ease-emphasized")}
          />
        ) : null}
      </svg>
      {children ? (
        <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
      ) : null}
    </div>
  );
}

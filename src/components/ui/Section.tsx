import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Background variant */
  tone?: "default" | "soft" | "muted" | "ink" | "ink-soft";
  /** Vertical padding intensity */
  size?: "sm" | "md" | "lg" | "xl";
  /** Optional id for anchor linking (#sluzby, #recenzie) */
  id?: string;
}

const tones = {
  default: "bg-white text-[var(--color-fg)]",
  soft: "bg-[var(--color-bg-soft)] text-[var(--color-fg)]",
  muted: "bg-[var(--color-bg-muted)] text-[var(--color-fg)]",
  ink: "bg-[var(--color-ink)] text-white",
  "ink-soft": "bg-[var(--color-ink-soft)] text-white",
};

const sizes = {
  sm: "py-12 md:py-16",
  md: "py-16 md:py-24",
  lg: "py-20 md:py-32",
  xl: "py-24 md:py-40",
};

export function Section({
  tone = "default",
  size = "lg",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "relative w-full overflow-hidden",
        tones[tone],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

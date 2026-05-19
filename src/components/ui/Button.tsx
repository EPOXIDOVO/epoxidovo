import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium tracking-tight whitespace-nowrap",
    "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
  ],
  {
    variants: {
      variant: {
        // Primary — čierne tlačidlo (hlavné CTA "Mám záujem")
        primary:
          "bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink-soft)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]",
        // Secondary — biele s borderom (vedľajšie CTA "Cenová ponuka")
        secondary:
          "bg-white text-[var(--color-fg)] border border-[var(--color-border-strong)] hover:bg-[var(--color-bg-soft)] hover:border-[var(--color-fg)]",
        // Outline — transparentné s borderom (na tmavom pozadí, "Ukážky podláh")
        outline:
          "bg-transparent text-[var(--color-fg)] border border-[var(--color-fg)] hover:bg-[var(--color-fg)] hover:text-white",
        // Brand — modré (akcent)
        brand:
          "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-soft)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]",
        // Ghost — bez pozadia, len text
        ghost:
          "bg-transparent text-[var(--color-fg)] hover:bg-[var(--color-bg-muted)]",
        // Link — text-only s underline
        link:
          "bg-transparent text-[var(--color-brand)] underline-offset-4 hover:underline px-0 py-0",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-[var(--radius-sm)]",
        md: "h-11 px-5 text-[0.95rem] rounded-[var(--radius-md)]",
        lg: "h-13 px-7 text-base rounded-[var(--radius-md)]",
        xl: "h-14 px-8 text-base rounded-[var(--radius-md)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  },
);

type ButtonBaseProps = VariantProps<typeof button> & {
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    href: string;
    external?: boolean;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(function Button({ variant, size, className, children, ...props }, ref) {
  const classes = cn(button({ variant, size }), className);

  if ("href" in props && props.href) {
    const { href, external, ...rest } = props;
    if (external) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          {...rest}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        {...(rest as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">)}
      >
        {children}
      </Link>
    );
  }

  const { ...rest } = props as ButtonAsButton;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      {...rest}
    >
      {children}
    </button>
  );
});

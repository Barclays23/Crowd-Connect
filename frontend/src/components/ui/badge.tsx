// frontend/src/components/ui/badge.tsx

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200",
  {
    variants: {
      variant: {
        // Default - subtle gray
        default:
          "bg-[var(--badge-default-bg)] text-[var(--badge-default-text)] border-[var(--badge-default-border)] hover:bg-[var(--bg-tertiary)]",

        // Primary - coral brand
        primary:
          "bg-[var(--badge-primary-bg)] text-[var(--badge-primary-text)] border-[var(--badge-primary-border)] hover:bg-[var(--badge-primary-bg)]/80",

        // Secondary - neutral
        secondary:
          "bg-[var(--badge-secondary-bg)] text-[var(--badge-secondary-text)] border-[var(--badge-secondary-border)] hover:bg-[var(--bg-tertiary)]",

        // Success - green
        success:
          "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)] border-[var(--badge-success-border)] hover:bg-[var(--badge-success-bg)]/80",

        // Error / Destructive - red
        destructive:
          "bg-[var(--badge-error-bg)] text-[var(--badge-error-text)] border-[var(--badge-error-border)] hover:bg-[var(--badge-error-bg)]/80",

        // Info - light coral
        info:
          "bg-[var(--badge-info-bg)] text-[var(--badge-info-text)] border-[var(--badge-info-border)] hover:bg-[var(--badge-info-bg)]/80",

        // Warning - amber
        warning:
          "bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)] border-[var(--badge-warning-border)] hover:bg-[var(--badge-warning-bg)]/80",

        // Accent - darker coral emphasis
        accent:
          "bg-[var(--badge-accent-bg)] text-[var(--badge-accent-text)] border-[var(--badge-accent-border)] hover:bg-[var(--badge-accent-bg)]/80",

        // Outline - transparent with border
        outline:
          "bg-[var(--badge-outline-bg)] text-[var(--badge-outline-text)] border-[var(--badge-outline-border)] hover:bg-[var(--badge-primary-bg)]",

        // Muted - subtle gray
        muted:
          "bg-[var(--badge-muted-bg)] text-[var(--badge-muted-text)] border-[var(--badge-muted-border)] hover:bg-[var(--bg-secondary)]",

        // Highlight - medium coral emphasis
        highlight:
          "bg-[var(--badge-highlight-bg)] text-[var(--badge-highlight-text)] border-[var(--badge-highlight-border)] hover:bg-[var(--badge-highlight-bg)]/80",

        // Subtle - very minimal styling
        subtle:
          "bg-[var(--badge-subtle-bg)] text-[var(--badge-subtle-text)] border-[var(--badge-subtle-border)] hover:bg-[var(--bg-secondary)]",

        // Brand - solid coral background
        brand:
          "bg-[var(--badge-brand-bg)] text-[var(--badge-brand-text)] border-[var(--badge-brand-border)] hover:bg-[var(--brand-primary-hover)] shadow-sm",

        // Neutral - balanced gray
        neutral:
          "bg-[var(--badge-neutral-bg)] text-[var(--badge-neutral-text)] border-[var(--badge-neutral-border)] hover:bg-[var(--badge-neutral-bg)]/80",

        // Inverse - high contrast
        inverse:
          "bg-[var(--badge-inverse-bg)] text-[var(--badge-inverse-text)] border-[var(--badge-inverse-border)] hover:opacity-90",

        // Gradient - coral gradient
        gradient:
          "bg-[var(--badge-gradient-bg)] text-[var(--badge-gradient-text)] border-[var(--badge-gradient-border)] hover:opacity-90 shadow-sm",
      },

      size: {
        default: "h-6 px-2.5 text-xs",
        sm: "h-5 px-2 text-xs",
        md: "h-7 px-3 text-sm",
        lg: "h-8 px-4 text-base",
      },

    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
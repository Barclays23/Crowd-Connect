// src/components/ui/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  1. cva now builds the classes with the global CSS variables               */
/* -------------------------------------------------------------------------- */
const buttonVariants = cva(
  // Base styles – unchanged (except we keep the cursor-pointer for consistency)
  "inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* --------------------------------------------------------------- */
        /*  Primary button – uses the global --btn-primary-* variables     */
        /* --------------------------------------------------------------- */
        default:
          "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)]",

        /* --------------------------------------------------------------- */
        /*  Secondary button – uses the global --btn-secondary-* vars      */
        /* --------------------------------------------------------------- */
        secondary:
          "bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] hover:bg-[var(--btn-secondary-hover)]",

        /* --------------------------------------------------------------- */
        /*  Destructive – we map it to the same coral-red primary palette  */
        /* --------------------------------------------------------------- */
        destructive:
          "bg-[var(--status-error)] text-white hover:bg-[var(--status-error-hover)]",

        /* --------------------------------------------------------------- */
        /*  Outline – uses border & background vars                        */
        /* --------------------------------------------------------------- */
        outline:
          "border border-[var(--border-default)] bg-[var(--card-bg)] hover:bg-[var(--bg-accent)] hover:text-[var(--text-primary)]",

        /* --------------------------------------------------------------- */
        /*  Ghost – subtle hover only                                      */
        /* --------------------------------------------------------------- */
        ghost:
          "bg-[var(--btn-ghost-bg)] text-[var(--btn-ghost-text)] hover:bg-[var(--btn-ghost-hover)] hover:text-[var(--text-primary)]",

        /* --------------------------------------------------------------- */
        /*  Link – brand colour with underline                             */
        /* --------------------------------------------------------------- */
        link:
          "text-[var(--brand-primary)] underline-offset-4 hover:underline",
      },

      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/* -------------------------------------------------------------------------- */
/*  2. Props – unchanged                                                    */
/* -------------------------------------------------------------------------- */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  3. Component – only the className generation changed                   */
/* -------------------------------------------------------------------------- */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
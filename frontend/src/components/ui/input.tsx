import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      // <input
      //   type={type}
      //   className={cn(
      //     "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      //     className,
      //   )}
      //   ref={ref}
      //   {...props}
      // />

      <input
        type={type}
        ref={ref}
        {...props}
        className={cn(
          "flex h-10 w-full rounded-md border px-3 py-2 text-base md:text-sm",
          "bg-[var(--form-input-bg)] text-[var(--form-input-text)]",
          "placeholder:text-[var(--form-placeholder)]",
          "focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-[var(--border-brand)]",
          "focus-visible:border-[var(--border-brand)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{
          borderColor: "var(--form-input-border)", // This works!
        }}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

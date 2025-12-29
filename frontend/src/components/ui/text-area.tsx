// src/components/ui/text-area.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex w-full rounded-md border px-3 py-2",
        "text-base md:text-sm",
        "bg-[var(--form-input-bg)]",
        "text-[var(--form-input-text)]",
        "placeholder:text-[var(--form-placeholder)]",
        "focus-visible:outline-none",
        "focus-visible:ring-1 focus-visible:ring-[var(--border-brand)]",
        "focus-visible:border-[var(--border-brand)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "resize-none", // most common default for forms
        className
      )}
      style={{
        borderColor: "var(--form-input-border)",
      }}
      {...props}
    />
  );
});

TextArea.displayName = "TextArea";

export { TextArea };
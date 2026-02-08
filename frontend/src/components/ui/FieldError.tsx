// src/components/ui/FieldError.tsx
import { cn } from "@/lib/utils";   // optional – if you use a cn helper

type FieldErrorProps = {
  message?: string;
  className?: string;
};

export function FieldError({ message, className }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p
      className={cn(
        "mt-1 text-xs text-destructive text-red-400",
        className
      )}
    >
      {message}
    </p>
  );
}
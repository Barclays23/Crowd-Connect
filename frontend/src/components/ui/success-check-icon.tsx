// src/components/ui/SuccessIcon.tsx
import { cn } from "@/lib/utils"

interface SuccessIconProps {
  size?: "sm" | "md" | "lg"
  className?: string
  iconClassName?: string
}

/**
 * Reusable success checkmark icon with brand-aware styling
 */
export function SuccessCheckIcon({
  size = "md",
  className,
  iconClassName,
}: SuccessIconProps) {
  // Size variants
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  }

  const iconSizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }

  return (
    <div
        className={cn(
            "mx-auto rounded-full flex items-center justify-center",
            "bg-[var(--badge-success-bg)]", // light green background (theme-aware)
            sizeClasses[size],
            className
        )}
    >


        <svg
            className={cn(
                "text-[var(--status-success)]",
                iconSizeClasses[size],
                iconClassName,
                "animate-drawCheck"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            >
            <path
                className="animate-[drawPath_0.8s_ease-out_forwards]"
                d="M5 13l4 4L19 7"
            />
        </svg>
    </div>
  )
}
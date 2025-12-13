// frontend/src/components/ui/skeleton.tsx

import { cn } from "@/lib/utils";
import * as React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        // Custom skeleton using your theme variables
        "animate-pulse rounded-md",
        "bg-[var(--bg-secondary)]",           // base color (light: #eeeeee, dark: #1f2937)
        "dark:bg-[var(--bg-tertiary)]",       // slightly darker in dark mode for depth
        // Optional subtle overlay for better "loading" feel (uncomment if you like it)
        // "relative overflow-hidden",
        // "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite]",
        // "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
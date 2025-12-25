import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  className?: string; // For custom positioning
  size?: "sm" | "md" | "lg";
}



export function LoadingSpinner1({ 
  message, 
  subMessage, 
  className, 
  size = "md" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16"
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3 p-8 animate-in fade-in duration-300",
      className
    )}>
      <div className="relative">
        {/* Decorative background ring */}
        <div className={cn(
          "absolute rounded-full border-4 border-[var(--brand-primary)] opacity-10",
          sizeClasses[size].replace('h-', 'h-').replace('w-', 'w-') // match sizes
        )} />
        {/* Main Spinner */}
        <Loader2 className={cn("animate-spin text-[var(--brand-primary)]", sizeClasses[size])} />
      </div>
      
        {message && (
        <p className="text-sm font-semibold text-[var(--text-primary)] animate-pulse">
            {message}
        </p>
        )}


        {subMessage && (
        <p className="text-xs text-[var(--text-tertiary)] opacity-80">
            {subMessage}
            <span className="inline-flex gap-1 ml-1">
            <span className="animate-bounce">.</span>
            <span className="animate-bounce delay-150">.</span>
            <span className="animate-bounce delay-300">.</span>
            </span>
        </p>
        )}



    </div>
  );
}
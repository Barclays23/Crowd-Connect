import { X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className,
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div
        className={cn(
          "relative w-full rounded-2xl border border-[var(--modal-border)] bg-[var(--modal-content-bg)] shadow-[var(--modal-shadow)] overflow-hidden",
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-muted)] bg-[var(--modal-bg)] px-6 py-4">
          <h2 className="text-xl font-bold text-[var(--heading-primary)]">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-lg hover:bg-[var(--btn-neutral-hover)]"
          >
            <X className="h-5 w-5 text-[var(--text-secondary)]" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
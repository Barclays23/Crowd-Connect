// frontend/src/components/user/UserPagination.tsx
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function UserPagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: UserPaginationProps) {
  // if (totalPages <= 1) return null;

  const safeTotalPages = Math.max(1, totalPages);

  const pages: number[] = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(safeTotalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className={cn("flex items-center justify-center gap-2 mt-8", className)}>
      {/* Previous */}
      <Button
        size="icon"
        className={cn(
          "h-9 w-9 rounded-lg border transition-colors",
          "border-(--border-default)",
          "bg-(--bg-tertiary) text-(--brand-primary)",
          "hover:bg-(--brand-primary) hover:text-(--text-secondary)",
          "disabled:opacity-50 disabled:pointer-events-none"
        )}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page numbers */}
      {pages.map((page) => (
        <Button
          key={page}
          size="icon"
          className={cn(
            "h-9 w-9 rounded-lg border font-medium transition-colors",
            page === currentPage
              ? cn(
                  "bg-(--brand-primary) text-(--btn-primary-text)",
                  "hover:bg-(--brand-primary-hover) border-transparent",
                  "shadow-sm"
                )
              : cn(
                  "bg-transparent text-(--text-secondary)",
                  "border-(--border-default)",
                  "hover:bg-(--bg-tertiary) hover:text-(--brand-primary)"
                )
          )}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      {/* Next */}
      <Button
        size="icon"
        className={cn(
          "h-9 w-9 rounded-lg border transition-colors",
          "border-(--border-default)",
          "bg-(--bg-tertiary) text-(--brand-primary)",
          "hover:bg-(--brand-primary) hover:text-(--text-secondary)",
          "disabled:opacity-50 disabled:pointer-events-none"
        )}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= safeTotalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
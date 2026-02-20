// frontend/src/components/ui/table.tsx

import * as React from "react";
import { cn } from "@/lib/utils";


// Table (outer wrapper)
const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto rounded-lg border border-(--table-border) shadow-(--table-shadow)">
      <table
        ref={ref}
        className={cn(
          "w-full caption-bottom text-sm bg-(--table-bg)",
          className
        )}
        {...props}
      />
    </div>
  )
);


// TableHeader
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "[&_tr]:border-b",
      "border-(--table-header-border)",
      "bg-(--table-header-bg)",
      "text-(--table-header-text)",
      className
    )}
    {...props}
  />
));


// TableBody (optional zebra striping via JS or CSS :nth-child)
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "[&_tr:nth-child(even):bg-(--table-striped-bg)",
      className
    )}
    {...props}
  />
));



const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-(--border-default) bg-(--bg-tertiary) font-medium text-(--text-primary)",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";



// TableRow
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-(--table-row-border)",
      "transition-colors duration-150",
      "hover:bg-(--table-row-hover)",
      "data-[state=selected]:bg-(--table-row-selected)",
      "data-[state=selected]:text-(--text-brand)",
      className
    )}
    {...props}
  />
));



const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-5 text-left align-middle font-semibold text-(--text-secondary) uppercase tracking-wider text-xs",
      "[&:has([role=checkbox]):pr-0",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";



const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "py-2 px-3.5 text-xs align-middle text-(--text-primary)",
      "[&:has([role=checkbox]):pr-0",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";



const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-6 text-sm text-(--text-secondary)", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";



export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
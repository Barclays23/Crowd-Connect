// frontend/src/components/user/user-events/UserEventsFilters.tsx
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EVENT_CATEGORIES } from "@/constants/event.constants";

interface UserEventsFiltersProps {
   searchTerm: string;
   setSearchTerm: (value: string) => void;
   statusFilter: string;
   setStatusFilter: (value: string) => void;
   categoryFilter: string;
   setCategoryFilter: (value: string) => void;
   setCurrentPage: (page: number) => void;
}

export function UserEventsFilters({
   searchTerm,
   setSearchTerm,
   statusFilter,
   setStatusFilter,
   categoryFilter,
   setCategoryFilter,
   setCurrentPage,
}: UserEventsFiltersProps) {
   return (
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl border border-(--border-default)">
         <div className="relative flex-1 sm:min-w-60">
            <Search className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-(--text-tertiary)" />
            <Input
               placeholder="Search events by title..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-9 sm:pl-10 h-9 sm:h-10 text-sm border-(--border-muted) focus-visible:ring-(--border-focus) bg-(--form-input-bg) text-(--text-primary)"
            />
         </div>

         <div className="flex gap-2.5 sm:gap-3">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
               <SelectTrigger className="w-full sm:w-40 h-9 sm:h-10 text-sm border-(--border-muted) bg-(--form-input-bg) text-(--text-primary)">
                  <SelectValue placeholder="Status" />
               </SelectTrigger>
               <SelectContent className="bg-(--card-bg) border-(--border-default)">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
               </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
               <SelectTrigger className="w-full sm:w-45 h-9 sm:h-10 text-sm border-(--border-muted) bg-(--form-input-bg) text-(--text-primary)">
                  <SelectValue placeholder="Category" />
               </SelectTrigger>
               <SelectContent className="bg-(--card-bg) border-(--border-default)">
                  <SelectItem value="all">All Categories</SelectItem>
                  {EVENT_CATEGORIES.map((cat) => (
                     <SelectItem key={cat} value={cat}>
                        {cat}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
         </div>
      </div>
   );
}
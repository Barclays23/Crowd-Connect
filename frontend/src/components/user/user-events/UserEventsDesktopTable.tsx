// frontend/src/components/user/user-events/UserEventsDesktopTable.tsx
import React from "react";
import { Search, ArrowDown, ArrowUpDown, ArrowUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner1 } from "@/components/shared/LoadingSpinner1";
import { StarRating } from "@/components/shared/StarRating";
import { formatDate2 } from "@/utils/dateAndTime.utils";
import { getEventCategoryBadgeVariant, getEventStatusBadgeVariant } from "@/utils/UI.utils";
import { capitalize } from "@/utils/namingConventions";
import { type IEventState, type EventSortField, type EventSortDirection } from "@/types/event.types";

interface UserEventsDesktopTableProps {
   events: IEventState[];
   loading: boolean;
   error: string | null;
   currentPage: number;
   itemsPerPage: number;
   sortBy: EventSortField;
   sortOrder: EventSortDirection;
   onSort: (field: EventSortField) => void;
   renderActions: (event: IEventState, compact: boolean) => React.ReactNode;
}

export function UserEventsDesktopTable({
   events,
   loading,
   error,
   currentPage,
   itemsPerPage,
   sortBy,
   sortOrder,
   onSort,
   renderActions,
}: UserEventsDesktopTableProps) {
   const getSortIcon = (field: EventSortField) => {
      if (sortBy !== field) return <ArrowUpDown className="inline h-3.5 w-3.5 ml-1 opacity-50" />;
      return sortOrder === "asc" ? (
         <ArrowUp className="inline h-3.5 w-3.5 ml-1" />
      ) : (
         <ArrowDown className="inline h-3.5 w-3.5 ml-1" />
      );
   };

   return (
      <div className="hidden lg:block rounded-xl border border-(--border-default) bg-(--table-bg) shadow-(--table-shadow) overflow-hidden relative">
         {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-(--bg-overlay) backdrop-blur-sm">
               <LoadingSpinner1 size="lg" message="Loading your events..." />
            </div>
         )}

         <Table>
            <TableHeader className="bg-(--table-header-bg) border-b border-(--table-header-border)">
               <TableRow className="hover:bg-transparent">
                  <TableHead className="w-14 text-(--table-header-text) font-semibold">#</TableHead>
                  <TableHead className="cursor-pointer min-w-70 text-(--table-header-text) font-semibold hover:text-(--brand-primary) transition-colors" onClick={() => onSort("title")}>
                     Event Details {getSortIcon("title")}
                  </TableHead>
                  <TableHead className="cursor-pointer text-(--table-header-text) font-semibold hover:text-(--brand-primary) transition-colors" onClick={() => onSort("startDateTime")}>
                     Schedule {getSortIcon("startDateTime")}
                  </TableHead>
                  <TableHead className="text-(--table-header-text) font-semibold">Audience</TableHead>
                  <TableHead className="text-(--table-header-text) font-semibold">Financials</TableHead>
                  <TableHead className="text-(--table-header-text) font-semibold">Status</TableHead>
                  <TableHead className="text-right pr-6 text-(--table-header-text) font-semibold">Actions</TableHead>
               </TableRow>
            </TableHeader>

            <TableBody>
               {error ? (
                  <TableRow>
                     <TableCell colSpan={7} className="h-48 text-center text-(--status-error) font-medium">
                        {error}
                     </TableCell>
                  </TableRow>
               ) : events.length === 0 && !loading ? (
                  <TableRow>
                     <TableCell colSpan={7} className="h-48 text-center text-(--text-tertiary)">
                        <div className="flex flex-col items-center gap-2">
                           <Search className="h-8 w-8 opacity-20" />
                           <p>No events found matching your criteria</p>
                        </div>
                     </TableCell>
                  </TableRow>
               ) : (
                  events.map((event, idx) => (
                     <TableRow
                        key={event.eventId}
                        className="border-b border-(--table-row-border) hover:bg-(--table-row-hover) transition-colors group"
                     >
                        <TableCell className="font-medium text-(--text-tertiary)">
                           {(currentPage - 1) * itemsPerPage + idx + 1}
                        </TableCell>

                        {/* Sleek Event Details with Badges & Rating */}
                        <TableCell>
                           <div className="flex flex-col gap-2 py-1">
                              <span className="font-bold text-[15px] text-(--text-primary) group-hover:text-(--brand-primary) transition-colors line-clamp-1">
                                 {event.title}
                              </span>
                              <div className="flex flex-wrap items-center gap-2">
                                 <Badge variant={event.format?.toLowerCase() === "online" ? "success" : "neutral"} size="sm" className="uppercase tracking-widest text-[9px]">
                                    {event.format}
                                 </Badge>
                                 {event.category && (
                                    <Badge variant={getEventCategoryBadgeVariant(event.category)} size="sm" className="font-medium">
                                       {event.category}
                                    </Badge>
                                 )}
                              </div>

                              {event.ratingAverage !== undefined && event.ratingAverage > 0 ? (
                                 <div className="flex items-center gap-1.5 mt-1 text-xs font-bold">
                                    <StarRating rating={event.ratingAverage} size={12} />
                                    <span className="text-(--badge-warning-text)">
                                       {event.ratingAverage.toFixed(1)}
                                    </span>
                                    <span className="text-(--text-tertiary) font-medium ml-0.5">
                                       ({event.totalReviews} {event.totalReviews === 1 ? "review" : "reviews"})
                                    </span>
                                 </div>
                              ) : (
                                 <div className="flex items-center gap-1 mt-1 text-[10px] text-(--text-tertiary) font-medium">
                                    <StarRating rating={0} size={10} />
                                    <span className="ml-0.5">No reviews yet</span>
                                 </div>
                              )}
                           </div>
                        </TableCell>

                        {/* 2. Visual Schedule */}
                        <TableCell>
                           <div className="flex flex-col gap-1 py-1">
                              <span className="text-[13px] font-semibold text-(--text-primary)">
                                 {formatDate2(event.startDateTime)}
                              </span>
                              <span className="text-[12px] text-(--text-tertiary) flex items-center gap-1.5 font-medium">
                                 <ArrowDown className="w-3 h-3 opacity-60" />
                                 {formatDate2(event.endDateTime)}
                              </span>
                           </div>
                        </TableCell>

                        {/* 3. Audience Ledger */}
                        <TableCell>
                           <div className="flex flex-col gap-1.5 w-30 text-[12px] py-1 bg-(--bg-secondary) px-3 rounded-lg border border-(--brand-primary-light)/50">
                              <div className="flex justify-between items-center">
                                 <span className="text-(--text-tertiary) font-medium">Capacity</span>
                                 <span className="font-semibold text-(--text-primary)">{event.capacity || "—"}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-(--text-tertiary) font-medium">Sold</span>
                                 <span className="font-bold text-(--brand-primary)">{event.soldTickets || 0}</span>
                              </div>
                              <div className="flex justify-between items-center border-t border-(--border-muted) pt-1 mt-0.5">
                                 <span className="text-(--text-tertiary) font-medium">Checked-in</span>
                                 <span className="font-bold text-(--status-success)">{event.checkedInCount || 0}</span>
                              </div>
                           </div>
                        </TableCell>

                        {/* 4. Financial Ledger */}
                        <TableCell>
                           <div className="flex flex-col gap-1.5 w-35 text-[12px] py-1">
                              <div className="flex justify-between items-center">
                                 <span className="text-(--text-tertiary) font-medium">Price</span>
                                 {event.ticketPrice === 0 || !event.ticketPrice ? (
                                    <Badge className="bg-(--status-success-bg) text-(--status-success) hover:bg-(--status-success-bg) border-none text-[9px] px-2 py-0 uppercase tracking-widest font-bold">
                                       Free
                                    </Badge>
                                 ) : (
                                    <span className="font-semibold text-(--text-primary)">
                                       ₹{event.ticketPrice.toLocaleString("en-IN")}
                                    </span>
                                 )}
                              </div>
                              <div className="flex justify-between items-center border-t border-(--border-default) pt-1.5 mt-0.5">
                                 <span className="text-(--text-tertiary) font-medium">Revenue</span>
                                 <span className="font-bold text-(--status-success) text-[13px]">
                                    ₹{(event.grossTicketRevenue || 0).toLocaleString("en-IN")}
                                 </span>
                              </div>
                           </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                           <Badge variant={getEventStatusBadgeVariant(event.eventStatus)} className="shadow-sm">
                              {capitalize(event.eventStatus)}
                           </Badge>
                        </TableCell>

                        {/* Action Buttons */}
                        <TableCell className="text-right pr-6">
                           <div className="flex items-center justify-end gap-0.5">
                              {renderActions(event, false)}
                           </div>
                        </TableCell>
                     </TableRow>
                  ))
               )}
            </TableBody>
         </Table>
      </div>
   );
}
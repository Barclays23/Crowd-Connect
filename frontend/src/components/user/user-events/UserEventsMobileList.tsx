// frontend/src/components/user/user-events/UserEventsMobileList.tsx
import React from "react";
import { Search, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner1 } from "@/components/shared/LoadingSpinner1";
import { StarRating } from "@/components/shared/StarRating";
import { formatDate2 } from "@/utils/dateAndTime.utils";
import { getEventCategoryBadgeVariant, getEventStatusBadgeVariant } from "@/utils/UI.utils";
import { capitalize } from "@/utils/namingConventions";
import { type IEventState } from "@/types/event.types";

interface UserEventsMobileListProps {
   events: IEventState[];
   loading: boolean;
   error: string | null;
   currentPage: number;
   itemsPerPage: number;
   renderActions: (event: IEventState, compact: boolean) => React.ReactNode;
}

export function UserEventsMobileList({
   events,
   loading,
   error,
   currentPage,
   itemsPerPage,
   renderActions,
}: UserEventsMobileListProps) {
   return (
      <div className="lg:hidden relative">
         {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-(--bg-overlay) backdrop-blur-sm rounded-xl">
               <LoadingSpinner1 size="md" message="Loading your events..." />
            </div>
         )}

         {error ? (
            <div className="h-40 flex items-center justify-center text-center text-(--status-error) font-medium text-sm rounded-xl border border-(--border-default)">
               {error}
            </div>
         ) : events.length === 0 && !loading ? (
            <div className="h-40 flex flex-col items-center justify-center gap-2 text-(--text-tertiary) text-sm rounded-xl border border-(--border-default)">
               <Search className="h-7 w-7 opacity-20" />
               <p>No events found matching your criteria</p>
            </div>
         ) : (
            <div className="space-y-3">
               {events.map((event, idx) => (
                  <div
                     key={event.eventId}
                     className="rounded-xl border border-(--border-default) bg-(--table-bg) shadow-(--table-shadow) p-3 sm:p-4 space-y-2.5"
                  >
                     {/* Title + status */}
                     <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                           <span className="text-[10px] font-semibold text-(--text-tertiary)">
                              #{(currentPage - 1) * itemsPerPage + idx + 1}
                           </span>
                           <h3 className="font-bold text-sm sm:text-[15px] text-(--text-primary) line-clamp-1">
                              {event.title}
                           </h3>
                        </div>
                        <Badge variant={getEventStatusBadgeVariant(event.eventStatus)} className="shrink-0 text-[9px] sm:text-[10px] shadow-sm">
                           {capitalize(event.eventStatus)}
                        </Badge>
                     </div>

                     {/* Format / category badges */}
                     <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={event.format?.toLowerCase() === "online" ? "success" : "neutral"} size="sm" className="uppercase tracking-widest text-[8px] sm:text-[9px]">
                           {event.format}
                        </Badge>
                        {event.category && (
                           <Badge variant={getEventCategoryBadgeVariant(event.category)} size="sm" className="text-[9px] sm:text-[10px] font-medium">
                              {event.category}
                           </Badge>
                        )}
                     </div>

                     {/* Rating */}
                     {event.ratingAverage !== undefined && event.ratingAverage > 0 ? (
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold">
                           <StarRating rating={event.ratingAverage} size={11} />
                           <span className="text-(--badge-warning-text)">{event.ratingAverage.toFixed(1)}</span>
                           <span className="text-(--text-tertiary) font-medium">
                              ({event.totalReviews} {event.totalReviews === 1 ? "review" : "reviews"})
                           </span>
                        </div>
                     ) : (
                        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-(--text-tertiary) font-medium">
                           <StarRating rating={0} size={10} />
                           <span>No reviews yet</span>
                        </div>
                     )}

                     <div className="h-px bg-(--table-row-border)" />

                     {/* Schedule */}
                     <div className="flex items-center justify-between text-[11px] sm:text-xs gap-2">
                        <span className="text-(--text-tertiary) font-semibold uppercase text-[9px] tracking-wide shrink-0">Schedule</span>
                        <div className="text-right min-w-0">
                           <p className="font-semibold text-(--text-primary) truncate">{formatDate2(event.startDateTime)}</p>
                           <p className="text-(--text-tertiary) flex items-center gap-1 justify-end">
                              <ArrowDown className="w-2.5 h-2.5 opacity-60 shrink-0" />
                              <span className="truncate">{formatDate2(event.endDateTime)}</span>
                           </p>
                        </div>
                     </div>

                     {/* Audience */}
                     <div className="grid grid-cols-3 gap-1 text-[10px] sm:text-[11px] bg-(--bg-secondary) rounded-lg border border-(--brand-primary-light)/50 px-2 sm:px-2.5 py-1.5 sm:py-2">
                        <div className="text-center">
                           <p className="text-(--text-tertiary) font-medium">Capacity</p>
                           <p className="font-semibold text-(--text-primary)">{event.capacity || "—"}</p>
                        </div>
                        <div className="text-center border-x border-(--border-muted)">
                           <p className="text-(--text-tertiary) font-medium">Sold</p>
                           <p className="font-bold text-(--brand-primary)">{event.soldTickets || 0}</p>
                        </div>
                        <div className="text-center">
                           <p className="text-(--text-tertiary) font-medium">Checked-in</p>
                           <p className="font-bold text-(--status-success)">{event.checkedInCount || 0}</p>
                        </div>
                     </div>

                     {/* Financials */}
                     <div className="flex items-center justify-between text-[11px] sm:text-xs">
                        <div className="flex items-center gap-1.5">
                           <span className="text-(--text-tertiary) font-medium">Price</span>
                           {event.ticketPrice === 0 || !event.ticketPrice ? (
                              <Badge className="bg-(--status-success-bg) text-(--status-success) hover:bg-(--status-success-bg) border-none text-[9px] px-2 py-0 uppercase tracking-widest font-bold">
                                 Free
                              </Badge>
                           ) : (
                              <span className="font-semibold text-(--text-primary)">₹{event.ticketPrice.toLocaleString("en-IN")}</span>
                           )}
                        </div>
                        <div className="flex items-center gap-1.5">
                           <span className="text-(--text-tertiary) font-medium">Revenue</span>
                           <span className="font-bold text-(--status-success) text-xs sm:text-[13px]">
                              ₹{(event.grossTicketRevenue || 0).toLocaleString("en-IN")}
                           </span>
                        </div>
                     </div>

                     {/* Actions */}
                     <div className="flex items-center justify-end gap-0.5 pt-1.5 border-t border-(--table-row-border)">
                        {renderActions(event, true)}
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}
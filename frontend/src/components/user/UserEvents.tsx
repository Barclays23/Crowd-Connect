// frontend/src/components/user/UserEvents.tsx
import { useState, useEffect, useCallback } from "react";
import {
   Search,
   Eye,
   Edit,
   Loader2,
   ArrowUpDown,
   ArrowUp,
   ArrowDown,
   Rocket,
   Ban,
   ScanLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { eventServices } from "@/services/eventServices";
import { toast } from "react-toastify";
import { UserPagination } from "@/components/user/UserPagination";
import { formatDate2 } from "@/utils/dateAndTimeFormats";
import { Modal } from "@/components/ui/modal";
import { LoadingSpinner1 } from "@/components/common/LoadingSpinner1";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import {
   type EventSortDirection,
   type EventSortField,
   type GetEventsApiResponse,
   type IEventState,
} from "@/types/event.types";
import { getEventCategoryBadgeVariant, getEventStatusBadgeVariant } from "@/utils/UI.utils";
import { ViewEventModal } from "@/components/admin/view-event-modal";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { type EventFormValues } from "@/schemas/event.schema";
import EditEventForm from "@/components/user/EditEventForm";
import { capitalize } from "@/utils/namingConventions";
import { buildEventFormData } from "@/utils/payload-utils/eventPayload.utils";
import { EventCheckIn } from "@/pages/event/EventCheckIn";
import { EVENT_CATEGORIES } from "@/constants/event.constants";





export default function UserEvents() {
   const [searchTerm, setSearchTerm] = useState("");
   const [statusFilter, setStatusFilter] = useState("all");
   const [categoryFilter, setCategoryFilter] = useState("all");

   const [sortBy, setSortBy] = useState<EventSortField>("createdAt");
   const [sortOrder, setSortOrder] = useState<EventSortDirection>("desc");

   const [events, setEvents] = useState<IEventState[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const [viewEvent, setViewEvent] = useState<IEventState | null>(null);
   const [editEvent, setEditEvent] = useState<IEventState | null>(null);
   const [editModalOpen, setEditModalOpen] = useState(false);

   const [publishModalOpen, setPublishModalOpen] = useState(false);
   const [eventToPublish, setEventToPublish] = useState<string | null>(null);
   const [isPublishing, setIsPublishing] = useState(false);

   const [cancelModalOpen, setCancelModalOpen] = useState(false);
   const [eventToCancel, setEventToCancel] = useState<string | null>(null);
   const [cancelReason, setCancelReason] = useState("");
   const [isCancelling, setIsCancelling] = useState(false);

   const [checkInEvent, setCheckInEvent] = useState<IEventState | null>(null);

   const itemsPerPage = 10;
   const [currentPage, setCurrentPage] = useState(1);
   const [totalEvents, setTotalEvents] = useState(0);
   const [totalPages, setTotalPages] = useState(1);

   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

   const handleEditEventSubmit = async (data: EventFormValues) => {
      if (!editEvent) return;

      const formData: FormData = buildEventFormData(data);

      try {
         const response = await eventServices.updateEventByHost({eventId: editEvent.eventId, formData});
         toast.success(response.message);
         setEditModalOpen(false);
         setEditEvent(null);
         fetchMyEvents();
         
      } catch (error: unknown) {
         const errorMessage = getApiErrorMessage(error);
         if (errorMessage) toast.error(errorMessage);
      }
   };

   useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedSearchTerm(searchTerm);
         setCurrentPage(1);
      }, 600);
      return () => clearTimeout(timer);
   }, [searchTerm]);

   const fetchMyEvents = useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
         const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: itemsPerPage.toString(),
            sortBy,
            sortOrder,
            ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
            ...(statusFilter !== "all" && { status: statusFilter }),
            ...(categoryFilter !== "all" && { category: categoryFilter }),
         });

         console.log('params :', params.toString())

         const response: GetEventsApiResponse = await eventServices.getMyEvents(params.toString());

         setEvents(response.eventsData ?? []);
         setTotalEvents(response.pagination.totalCount ?? 0);
         setTotalPages(
            response.pagination.totalPages ?? Math.ceil((response.pagination.totalCount ?? 0) / itemsPerPage)
         );

      } catch (error: unknown) {
         const errorMessage = getApiErrorMessage(error);
         if (errorMessage) toast.error(errorMessage);
         setError(errorMessage);
      } finally {
         setLoading(false);
      }
   }, [currentPage, debouncedSearchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

   
   useEffect(() => {
      fetchMyEvents();
   }, [fetchMyEvents]);

   
   const handleSort = (field: EventSortField) => {
      if (sortBy === field) {
         setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
         setSortBy(field);
         setSortOrder("asc");
      }
      setCurrentPage(1);
   };

   const getSortIcon = (field: EventSortField) => {
      if (sortBy !== field) return <ArrowUpDown className="inline h-3.5 w-3.5 ml-1 opacity-50" />;
      return sortOrder === "asc" ? (
         <ArrowUp className="inline h-3.5 w-3.5 ml-1" />
      ) : (
         <ArrowDown className="inline h-3.5 w-3.5 ml-1" />
      );
   };

   const requestPublish = (eventId: string) => {
      setEventToPublish(eventId);
      setPublishModalOpen(true);
   };

   const confirmPublish = async () => {
      if (!eventToPublish) return;

      try {
         setIsPublishing(true);
         const response = await eventServices.publishEvent(eventToPublish);
         toast.success(response.message);
         fetchMyEvents();
      } catch (error: unknown) {
         const errorMessage = getApiErrorMessage(error);
         if (errorMessage) toast.error(errorMessage);
      } finally {
         setPublishModalOpen(false);
         setEventToPublish(null);
         setIsPublishing(false);
      }
   };

   const requestCancel = (eventId: string) => {
      setEventToCancel(eventId);
      setCancelReason("");
      setCancelModalOpen(true);
   };

   const confirmCancel = async () => {
      if (!eventToCancel || !cancelReason.trim()) return;

      try {
         setIsCancelling(true);
         const response = await eventServices.cancelEvent(eventToCancel, cancelReason);
         toast.success(response.message);
         fetchMyEvents();
      } catch (error: unknown) {
         const errorMessage = getApiErrorMessage(error);
         if (errorMessage) toast.error(errorMessage);
      } finally {
         setCancelModalOpen(false);
         setEventToCancel(null);
         setIsCancelling(false);
      }
   };

   return (
      <div className="space-y-6">
         {/* Header Section */}
         <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
               <h2 className="text-2xl font-bold tracking-tight text-(--heading-primary)">My Events</h2>
               <p className="text-(--text-secondary) mt-1.5 text-sm flex items-center gap-2">
                  <span>Manage and track your hosted events</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-(--border-strong)"></span>
                  <span className="font-semibold text-(--brand-primary)">{totalEvents} Total</span>
               </p>
            </div>
         </div>

         {/* Filters Toolbar */}
         <div className="flex flex-wrap gap-3 p-4 rounded-xl border border-(--border-default) bg-(--card-bg) shadow-(--card-shadow)">
            <div className="relative flex-1 min-w-60">
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-tertiary)" />
               <Input
                  placeholder="Search events by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-(--border-muted) focus-visible:ring-(--border-focus) bg-(--form-input-bg) text-(--text-primary)"
               />
            </div>

            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
               <SelectTrigger className="w-40 h-10 border-(--border-muted) bg-(--form-input-bg) text-(--text-primary)">
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
               <SelectTrigger className="w-45 h-10 border-(--border-muted) bg-(--form-input-bg) text-(--text-primary)">
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

         {/* Main Table Card */}
         <div className="rounded-xl border border-(--border-default) bg-(--table-bg) shadow-(--table-shadow) overflow-hidden relative">
            {loading && (
               <div className="absolute inset-0 z-10 flex items-center justify-center bg-(--bg-overlay) backdrop-blur-sm">
                  <LoadingSpinner1 size="lg" message="Loading your events..." />
               </div>
            )}

            <Table>
               <TableHeader className="bg-(--table-header-bg) border-b border-(--table-header-border)">
                  <TableRow className="hover:bg-transparent">
                     <TableHead className="w-14 text-(--table-header-text) font-semibold">#</TableHead>
                     <TableHead className="cursor-pointer min-w-70 text-(--table-header-text) font-semibold hover:text-(--brand-primary) transition-colors" onClick={() => handleSort("title")}>
                        Event Details {getSortIcon("title")}
                     </TableHead>
                     <TableHead className="cursor-pointer text-(--table-header-text) font-semibold hover:text-(--brand-primary) transition-colors" onClick={() => handleSort("startDateTime")}>
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

                           {/* Sleek Event Details with Badges */}
                           <TableCell>
                              <div className="flex flex-col gap-2 py-1">
                                 <span className="font-bold text-[15px] text-(--text-primary) group-hover:text-(--brand-primary) transition-colors line-clamp-1">
                                    {event.title}
                                 </span>
                                 <div className="flex flex-wrap items-center gap-2">
                                    {/* Format Badge */}
                                    <Badge 
                                       variant={event.format?.toLowerCase() === "online" ? "success" : "neutral"} 
                                       size="sm"
                                       className="uppercase tracking-widest text-[9px]"
                                    >
                                       {event.format}
                                    </Badge>
                                    
                                    {/* Category Badge */}
                                    {event.category && (
                                       <Badge 
                                          variant={getEventCategoryBadgeVariant(event.category)}
                                          size="sm"
                                          className="font-medium"
                                       >
                                          {event.category}
                                       </Badge>
                                    )}
                                 </div>
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
                              <div className="flex flex-col gap-1.5 w-30 text-[12px] py-1 bg-(--bg-secondary) px-3 rounded-lg border border-(--border-default)">
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
                                 <Button variant="ghost" size="icon" title="View Event" onClick={() => setViewEvent(event)} className="text-(--text-secondary) hover:text-(--brand-primary) hover:bg-(--bg-accent)">
                                    <Eye className="h-4.5 w-4.5" />
                                 </Button>

                                 {(event.eventStatus === "draft" || event.eventStatus === "upcoming" || event.eventStatus === "ongoing") && (
                                    <Button variant="ghost" size="icon" title="Edit Event" onClick={() => { setEditEvent(event); setEditModalOpen(true); }} className="text-(--text-secondary) hover:text-(--brand-primary) hover:bg-(--bg-accent)">
                                       <Edit className="h-4.5 w-4.5" />
                                    </Button>
                                 )}

                                 {event.eventStatus === "draft" && (
                                    <Button variant="ghost" size="icon" title="Publish Event" onClick={() => requestPublish(event.eventId)} className="text-(--status-success) hover:bg-(--status-success-bg)">
                                       <Rocket className="h-4.5 w-4.5" />
                                    </Button>
                                 )}

                                 {!(["completed", "cancelled", "suspended"].includes(event.eventStatus)) && (
                                    <Button variant="ghost" size="icon" title="Cancel Event" onClick={() => requestCancel(event.eventId)} className="text-(--status-error) hover:bg-(--badge-error-bg)">
                                       <Ban className="h-4.5 w-4.5" />
                                    </Button>
                                 )}

                                 {(event.eventStatus === "upcoming" || event.eventStatus === "ongoing") && (
                                    <Button variant="ghost" size="icon" title="Gate Check-In" onClick={() => setCheckInEvent(event)} className="text-(--brand-primary) hover:bg-(--badge-primary-bg)">
                                       <ScanLine className="h-4.5 w-4.5" />
                                    </Button>
                                 )}
                              </div>
                           </TableCell>
                        </TableRow>
                     ))
                  )}
               </TableBody>
            </Table>
         </div>

         {/* Pagination */}
         {!loading && events.length > 0 && (
            <div className="pt-2">
               <UserPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
               />
            </div>
         )}

         <Modal isOpen={!!viewEvent} onClose={() => setViewEvent(null)} title="Event Details" size="lg">
            {viewEvent && <ViewEventModal event={viewEvent} />}
         </Modal>

         <Modal isOpen={editModalOpen} onClose={() => { setEditModalOpen(false); setEditEvent(null); }} title={`Edit Event : ${editEvent?.title}`} size="lg">
            {editEvent && (
               <EditEventForm key={editEvent.eventId} editEvent={editEvent} onSubmit={handleEditEventSubmit} onCancel={() => { setEditModalOpen(false); setEditEvent(null); }} />
            )}
         </Modal>

         <ConfirmationModal isOpen={publishModalOpen} onClose={() => { setPublishModalOpen(false); setEventToPublish(null); }} onConfirm={confirmPublish} title="Publish Event" description="Once published, the event will be visible to everyone and users can start registering/booking tickets." confirmText="Publish Now" cancelText="Cancel" variant="default" loading={isPublishing} />

         <Modal isOpen={cancelModalOpen} onClose={() => { if (!isCancelling) { setCancelModalOpen(false); setEventToCancel(null); } }} title="Cancel Event" size="md">
            <div className="space-y-4">
               <p className="text-sm text-(--text-secondary)">
                  Are you sure you want to cancel this event? This action cannot be undone, and all confirmed bookings will be refunded automatically.
               </p>
               <div className="space-y-2">
                  <label className="text-sm font-semibold text-(--text-primary)">
                     Reason for Cancellation <span className="text-(--status-error)">*</span>
                  </label>
                  <textarea
                     className="w-full min-h-24 rounded-lg border border-(--form-input-border) bg-(--form-input-bg) px-3 py-2 text-sm text-(--form-input-text) shadow-sm placeholder:text-(--form-placeholder) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary-light)"
                     placeholder="Please provide a reason to notify your attendees..."
                     value={cancelReason}
                     onChange={(e) => setCancelReason(e.target.value)}
                     disabled={isCancelling}
                  />
               </div>
               <div className="flex justify-end gap-3 pt-4 border-t border-(--border-default) mt-2">
                  <Button variant="outline" onClick={() => setCancelModalOpen(false)} disabled={isCancelling} className="border-(--border-strong) text-(--text-primary) hover:bg-(--bg-secondary)">
                     Keep Event
                  </Button>
                  <Button variant="destructive" onClick={confirmCancel} disabled={isCancelling || cancelReason.trim() === ""} className="bg-(--status-error) text-white hover:bg-(--status-error-hover)">
                     {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                     Confirm Cancellation
                  </Button>
               </div>
            </div>
         </Modal>

         <Modal isOpen={!!checkInEvent} onClose={() => setCheckInEvent(null)} title={`Check-In : ${checkInEvent?.title}`} size="lg">
            {checkInEvent && <EventCheckIn event={checkInEvent} />}
         </Modal>
      </div>
   );
}
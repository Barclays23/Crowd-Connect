// frontend/src/components/user/UserEvents.tsx
import { useState, useEffect, useCallback, useRef } from "react";
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
  EVENT_CATEGORIES,
  type EventSortDirection,
  type EventSortField,
  type GetEventsApiResponse,
  type IEventState,
} from "@/types/event.types";
import { getEventStatusBadgeVariant } from "@/utils/UI.utils";
import { ViewEventModal } from "@/components/admin/view-event-modal";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { type EventFormValues } from "@/schemas/event.schema";
import EditEventForm from "@/components/user/EditEventForm";
import { capitalize } from "@/utils/namingConventions";
import { buildEventFormData } from "@/utils/payload-utils/eventPayload.utils";




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

   
   const hasFetched = useRef(false);

   useEffect(() => {
      if (hasFetched.current) return;
      hasFetched.current = true;

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
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
               <h2 className="text-2xl font-bold tracking-tight">My Events</h2>
               <p className="text-muted-foreground mt-1">
                  Events you have created • {totalEvents} total
               </p>
            </div>
         </div>

         {/* Filters */}
         <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-60">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
               />
            </div>

            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
               <SelectTrigger className="w-40 h-10">
                  <SelectValue placeholder="Status" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
               </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
               <SelectTrigger className="w-44 h-10">
                  <SelectValue placeholder="Category" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {EVENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                     {cat}
                  </SelectItem>
                  ))}
               </SelectContent>
            </Select>
         </div>

         {/* Table */}
         <div className="rounded-lg bg-card">
            {loading && (
               <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                  <LoadingSpinner1 size="lg" message="Loading your events..." />
               </div>
            )}

            <Table>
               <TableHeader>
                  <TableRow>
                  <TableHead className="w-14">#</TableHead>
                  <TableHead
                     className="cursor-pointer"
                     onClick={() => handleSort("title")}
                  >
                     Event {getSortIcon("title")}
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead
                     className="cursor-pointer"
                     onClick={() => handleSort("startDateTime")}
                  >
                     Starts {getSortIcon("startDateTime")}
                  </TableHead>
                  <TableHead
                     className="cursor-pointer"
                     onClick={() => handleSort("endDateTime")}
                  >
                     Ends {getSortIcon("endDateTime")}
                  </TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-5">Actions</TableHead>
                  </TableRow>
               </TableHeader>

               <TableBody>
                  {loading ? (
                  <TableRow>
                     <TableCell colSpan={8} className="h-48 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <span className="text-muted-foreground">Loading...</span>
                     </TableCell>
                  </TableRow>
                  ) : error ? (
                  <TableRow>
                     <TableCell colSpan={8} className="h-48 text-center text-destructive">
                        {error}
                     </TableCell>
                  </TableRow>
                  ) : events.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                        No events found
                     </TableCell>
                  </TableRow>
                  ) : (
                  events.map((event, idx) => (
                     <TableRow key={event.eventId}>
                        <TableCell className="font-medium">
                           {(currentPage - 1) * itemsPerPage + idx + 1}
                        </TableCell>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{event.category}</TableCell>
                        <TableCell className="text-muted-foreground">
                           {formatDate2(event.startDateTime)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                           {formatDate2(event.endDateTime)}
                        </TableCell>
                        <TableCell>
                           <Badge variant={event.format === "online" ? "secondary" : "outline"}>
                              {capitalize(event.format)}
                           </Badge>
                        </TableCell>
                        <TableCell>
                           <Badge variant={getEventStatusBadgeVariant(event.eventStatus)}>
                              {capitalize(event.eventStatus)}
                           </Badge>
                        </TableCell>

                        {/* Action Buttons */}
                        <TableCell className="text-right pr-5">
                           <div className="flex items-center justify-end gap-1">
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 title="View Event"
                                 onClick={() => setViewEvent(event)}
                              >
                                 <Eye className="h-4 w-4" />
                              </Button>

                              {/* Show edit only for draft / upcoming events — adjust logic as needed */}
                              {(event.eventStatus === "draft" || event.eventStatus === "upcoming" || event.eventStatus === "ongoing") && (
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Edit Event"
                                    onClick={() => {
                                       setEditEvent(event);
                                       setEditModalOpen(true);
                                    }}
                                 >
                                    <Edit className="h-4 w-4" />
                                 </Button>
                              )}
                              {event.eventStatus === "draft" && (
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Publish Event"
                                    onClick={() => requestPublish(event.eventId)}
                                 >
                                    <Rocket className="h-4 w-4 text-green-600" />
                                 </Button>
                              )}
                              {!(["completed", "cancelled", "suspended"].includes(event.eventStatus)) && (
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Cancel Event"
                                    onClick={() => requestCancel(event.eventId)}
                                 >
                                    <Ban className="h-4 w-4 text-destructive" />
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
         <UserPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
         />

         {/* View Event Modal */}
         <Modal isOpen={!!viewEvent} onClose={() => setViewEvent(null)} title="Event Details" size="lg">
            {viewEvent && <ViewEventModal event={viewEvent} />}
         </Modal>

         {/* Edit Event Modal */}
         <Modal
            isOpen={editModalOpen}
            onClose={() => {
               setEditModalOpen(false);
               setEditEvent(null);
            }}
            title={`Edit Event : ${editEvent?.title}`}
            size="lg"
         >
            {editEvent && (
               <EditEventForm
                  key={editEvent.eventId}
                  editEvent={editEvent}
                  onSubmit={handleEditEventSubmit}
                  onCancel={() => {
                     setEditModalOpen(false);
                     setEditEvent(null);
                  }}
               />
            )}
         </Modal>

         {/* Publish Event Modal */}
         <ConfirmationModal
            isOpen={publishModalOpen}
            onClose={() => {
               setPublishModalOpen(false);
               setEventToPublish(null);
            }}
            onConfirm={confirmPublish}
            title="Publish Event"
            description="Once published, the event will be visible to everyone and users can start registering/booking tickets."
            confirmText="Publish Now"
            cancelText="Cancel"
            variant="default"
            loading={isPublishing}
         />

         {/* Cancel Event Modal */}
         <Modal
            isOpen={cancelModalOpen}
            onClose={() => {
               if (!isCancelling) {
                  setCancelModalOpen(false);
                  setEventToCancel(null);
               }
            }}
            title="Cancel Event"
            size="md"
         >
            <div className="space-y-4">
               <p className="text-sm text-muted-foreground">
                  Are you sure you want to cancel this event? This action cannot be undone, and all confirmed bookings will be refunded automatically.
               </p>
               
               <div className="space-y-2">
                  <label className="text-sm font-medium">
                     Reason for Cancellation <span className="text-destructive">*</span>
                  </label>
                  <textarea
                     className="w-full min-h-24 p-3 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                     placeholder="Please provide a reason to notify your attendees..."
                     value={cancelReason}
                     onChange={(e) => setCancelReason(e.target.value)}
                     disabled={isCancelling}
                  />
               </div>

               <div className="flex justify-end gap-2 pt-4">
                  <Button
                     variant="outline"
                     onClick={() => setCancelModalOpen(false)}
                     disabled={isCancelling}
                  >
                     Keep Event
                  </Button>
                  <Button
                     variant="destructive"
                     onClick={confirmCancel}
                     disabled={isCancelling || cancelReason.trim() === ""}
                  >
                     {isCancelling ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     ) : null}
                     Confirm Cancellation
                  </Button>
               </div>
            </div>
         </Modal>
      </div>
   );
}
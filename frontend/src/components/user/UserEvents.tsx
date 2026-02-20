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




export default function UserEvents() {
   const [searchTerm, setSearchTerm] = useState("");
   const [statusFilter, setStatusFilter] = useState("all");
   const [categoryFilter, setCategoryFilter] = useState("all");
   const [currentPage, setCurrentPage] = useState(1);

   const [sortBy, setSortBy] = useState<EventSortField>("createdAt");
   const [sortOrder, setSortOrder] = useState<EventSortDirection>("desc");

   const [events, setEvents] = useState<IEventState[]>([]);
   const [totalEvents, setTotalEvents] = useState(0);
   const [totalPages, setTotalPages] = useState(1);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const [viewEvent, setViewEvent] = useState<IEventState | null>(null);
   const [editEvent, setEditEvent] = useState<IEventState | null>(null);

   const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
   const [eventToPublish, setEventToPublish] = useState<string | null>(null);
   const [isPublishing, setIsPublishing] = useState(false);

   const itemsPerPage = 10;

   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

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
      setPublishConfirmOpen(true);
   };


   const confirmPublish = async () => {
      if (!eventToPublish) return;

      try {
         setIsPublishing(true);
         const response = await eventServices.publishEvent(eventToPublish);
         toast.success(response.message);

         fetchMyEvents(); // refresh list

      } catch (error: unknown) {
         const errorMessage = getApiErrorMessage(error);
         if (errorMessage) toast.error(errorMessage);
      } finally {
         setPublishConfirmOpen(false);
         setEventToPublish(null);
         setIsPublishing(false);
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

            {/* Optional: Create event button */}
            {/* <Button>Create Event</Button> */}
         </div>

         {/* Filters */}
         <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[240px]">
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
                           {event.format}
                        </Badge>
                        </TableCell>
                        <TableCell>
                        <Badge variant={getEventStatusBadgeVariant(event.eventStatus)}>
                           {event.eventStatus}
                        </Badge>
                        </TableCell>

                        {/* Action Buttons */}
                        <TableCell className="text-right pr-5">
                           <div className="flex items-center justify-end gap-1">
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 onClick={() => setViewEvent(event)}
                              >
                                 <Eye className="h-4 w-4" />
                              </Button>

                              {/* Show edit only for draft / upcoming events — adjust logic as needed */}
                              {(event.eventStatus === "draft" || event.eventStatus === "upcoming") && (
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditEvent(event)}
                                 >
                                    <Edit className="h-4 w-4" />
                                 </Button>
                              )}
                              {event.eventStatus === "draft" && (
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => requestPublish(event.eventId)}
                                 >
                                    <Rocket className="h-4 w-4 text-green-600" />
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

         {/* Modals */}
         <Modal isOpen={!!viewEvent} onClose={() => setViewEvent(null)} title="Event Details" size="lg">
            {viewEvent && <ViewEventModal event={viewEvent} />}
         </Modal>

         <Modal isOpen={!!editEvent} onClose={() => setEditEvent(null)} title="Edit Event" size="lg">
            {editEvent && (
               <div className="py-8 text-center text-muted-foreground">
                  Edit event form coming soon...
                  {/* <EditEventForm event={editEvent} onSuccess={() => { fetchMyEvents(); setEditEvent(null); }} /> */}
               </div>
            )}
         </Modal>

         {/* publish event confirmation */}
         <ConfirmationModal
            isOpen={publishConfirmOpen}
            onClose={() => {
               setPublishConfirmOpen(false);
               setEventToPublish(null);
            }}
            onConfirm={confirmPublish}
            title="Publish Event"
            description="Once published, the event will be visible to everyone and users can start registering/booking tickets."
            confirmText="Publish Now"
            cancelText="Cancel"
            variant="default" // or "success" if you add that variant later
            loading={false} // you can make this dynamic if publish takes time
         />
      </div>
   );
}
// frontend/src/components/admin/events-list.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Download,
  Eye,
  Edit,
  Ban,
  Loader2,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { eventServices } from "@/services/eventServices";
import { toast } from "react-toastify";
import { AdminPagination } from "./admin-pagination";
import { formatDate2 } from "@/utils/dateAndTimeFormats";
import { Modal } from "../ui/modal";
import { ConfirmationModal } from "./confirmation-modal";
import { LoadingSpinner1 } from "../common/LoadingSpinner1";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { EVENT_CATEGORIES, type IEventState } from "@/types/event.types";
import { getEventStatusBadgeVariant } from "@/utils/UI.utils";
import { ViewEventModal } from "@/components/admin/view-event-modal";

interface IPagination {
  totalCount: number;
  totalPages: number;
  page: number;
  limit: number;
}

interface ApiResponse {
  eventsData: IEventState[];
  pagination: IPagination;
}


type SortField = "createdAt" | "startDateTime" | "endDateTime" | "title" | "ticketPrice" | "grossTicketRevenue";
type SortDirection = "asc" | "desc"



export function EventsList() {
  // Filters & UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [ticketTypeFilter, setTicketTypeFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  // Sorting state
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortDirection>("desc");

  // Data state
  const [events, setEvents] = useState<IEventState[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states (kept as-is)
  const [viewEvent, setViewEvent] = useState<IEventState | null>(null);
  const [editEvent, setEditEvent] = useState<IEventState | null>(null);
  const [suspendEvent, setSuspendEvent] = useState<IEventState | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<IEventState | null>(null);

  const [suspendingEventId, setSuspendingEventId] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const itemsPerPage = 10;

   // Debounced search
   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
   useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedSearchTerm(searchTerm);
         setCurrentPage(1);
      }, 500);
      return () => clearTimeout(timer);
   }, [searchTerm]);


   const fetchEvents = useCallback(async () => {
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
            ...(ticketTypeFilter !== "all" && { ticketType: ticketTypeFilter }),
            ...(formatFilter !== "all" && { format: formatFilter }),
         });

         const response: ApiResponse = await eventServices.getAllEvents(params.toString());

         let fetchedEvents = response.eventsData;

         setEvents(fetchedEvents);
         setTotalEvents(response.pagination.totalCount);
         setTotalPages(response.pagination.totalPages || Math.ceil(response.pagination.totalCount / itemsPerPage));

      } catch (error: unknown) {
         const errorMessage = getApiErrorMessage(error);
         if (errorMessage) toast.error(errorMessage);
         setError(errorMessage);
      } finally {
         setLoading(false);
      }
   }, [currentPage, debouncedSearchTerm, statusFilter, categoryFilter, formatFilter, ticketTypeFilter, sortBy, sortOrder]);

   useEffect(() => {
      fetchEvents();
   }, [fetchEvents]);

   useEffect(() => {
      setSelectedEvents([]);
   }, [currentPage, debouncedSearchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

   const toggleEventSelection = (eventId: string) => {
      setSelectedEvents((prev) =>
         prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
      );
   };

   const toggleAllEvents = () => {
      setSelectedEvents((prev) =>
         prev.length === events.length && events.length > 0
         ? []
         : events.map((ev) => ev.eventId)
      );
   };

   const handleSuspendEvent = async (event: IEventState) => {
      try {
         setSuspendingEventId(event.eventId);
         const response = await eventServices.suspendEvent(event.eventId, "Admin cancelled");
         toast.success(response.message);

         setEvents((prev) =>
            prev.map((e) =>
               e.eventId === event.eventId ? { ...e, eventStatus: response.updatedStatus } : e
            )
         );
      } catch (error: unknown) {
         const errorMessage = getApiErrorMessage(error)
         if (errorMessage) toast.error(errorMessage);

      } finally {
         setSuspendingEventId(null);
         setSuspendEvent(null);
      }
   };

   const handleDeleteEvent = async (event: IEventState) => {
      try {
         setDeletingEventId(event.eventId);
         const response = await eventServices.deleteEvent(event.eventId);
         toast.success(response.message);

         setEvents((prev) => prev.filter((e) => e.eventId !== event.eventId));
         setTotalEvents(totalEvents-1);

      } catch (err) {
         const errorMessage = getApiErrorMessage(error);
         if (errorMessage) toast.error(errorMessage);

      } finally {
         setDeletingEventId(null);
         setDeleteEvent(null);
      }
   };


   const handleSort = (field: SortField) => {
      if (sortBy === field) {
         setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
         setSortBy(field);
         setSortOrder("asc");
      }
      setCurrentPage(1);
   };

   const getSortIcon = (field: SortField) => {
      if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-40" />;
      return sortOrder === "asc" ? (
         <ArrowUp className="h-4 w-4 ml-1" />
      ) : (
         <ArrowDown className="h-4 w-4 ml-1" />
      );
   };




   return (
      <Card className="shadow-(--shadow-sm) border border-(--border-default) rounded-2xl overflow-hidden">
         <CardHeader className="bg-(--card-bg) border-b border-(--border-default)">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <div>
                  <CardTitle className="text-2xl font-bold text-(--heading-primary)">Events</CardTitle>
                  <p className="text-sm text-(--text-secondary) mt-1">
                  Manage all platform events ({totalEvents} total)
                  </p>
               </div>
            </div>
         </CardHeader>

         <CardContent className="p-6 bg-(--card-bg)">
            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6 flex-wrap">
               <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-tertiary)" />
                  <Input
                  placeholder="Search by title, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-11 border-(--border-muted) rounded-xl focus-visible:ring-2 focus-visible:ring-(--brand-primary-light)"
                  />
               </div>

               <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-40 h-11 rounded-xl border-(--border-muted)">
                  <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
               </Select>

               <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-48 h-11 rounded-xl border-(--border-muted)">
                  <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {EVENT_CATEGORIES.map(cat => (
                     <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                  </SelectContent>
               </Select>

               <Select value={formatFilter} onValueChange={(v) => { setFormatFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-40 h-11 rounded-xl border-(--border-muted)">
                  <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
               </Select>

               <Select value={ticketTypeFilter} onValueChange={(v) => { setTicketTypeFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-40 h-11 rounded-xl border-(--border-muted)">
                  <SelectValue placeholder="Ticket Type" />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
               </Select>

               {selectedEvents.length > 0 && (
                  <Button variant="outline" className="h-11 rounded-xl border-(--border-strong) hover:bg-(--bg-secondary)">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV ({selectedEvents.length})
                  </Button>
               )}
            </div>

            {/* Table */}
            <div className="relative">
               {loading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-(--bg-overlay)/50">
                  <LoadingSpinner1 size="lg" message="Loading events..." />
                  </div>
               )}

               <div className="rounded-xl border border-(--border-default) overflow-hidden bg-(--card-bg)">
                  <Table>
                  <TableHeader>
                     <TableRow className="bg-(--bg-tertiary) hover:bg-(--bg-tertiary)">
                        <TableHead className="w-12 h-12">
                        <Checkbox
                           checked={events.length > 0 && selectedEvents.length === events.length}
                           onCheckedChange={toggleAllEvents}
                           disabled={loading}
                        />
                        </TableHead>
                        <TableHead className="text-(--text-secondary) font-semibold">Sl No</TableHead>
                        <TableHead
                        className="text-(--text-secondary) font-semibold cursor-pointer"
                        onClick={() => handleSort("title")}
                        >
                        <div className="flex items-center">
                           Event
                           {getSortIcon("title")}
                        </div>
                        </TableHead>
                        <TableHead className="text-(--text-secondary) font-semibold">Category</TableHead>
                        <TableHead
                        className="text-(--text-secondary) font-semibold cursor-pointer"
                        onClick={() => handleSort("startDateTime")}
                        >
                        <div className="flex items-center">
                           Start Date
                           {getSortIcon("startDateTime")}
                        </div>
                        </TableHead>
                        <TableHead
                        className="text-(--text-secondary) font-semibold cursor-pointer"
                        onClick={() => handleSort("endDateTime")}
                        >
                        <div className="flex items-center">
                           End Date
                           {getSortIcon("endDateTime")}
                        </div>
                        </TableHead>
                        <TableHead className="text-(--text-secondary) font-semibold">Format</TableHead>
                        <TableHead className="text-(--text-secondary) font-semibold">Ticket Type</TableHead>
                        <TableHead
                        className="text-(--text-secondary) font-semibold cursor-pointer"
                        onClick={() => handleSort("grossTicketRevenue")}
                        >
                        <div className="flex items-center">
                           Gross Revenue
                           {getSortIcon("grossTicketRevenue")}
                        </div>
                        </TableHead>
                        <TableHead className="text-(--text-secondary) font-semibold">Status</TableHead>
                        <TableHead className="text-right text-(--text-secondary) font-semibold">Actions</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {loading ? (
                        <TableRow>
                        <TableCell colSpan={11} className="h-32 text-center">
                           <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>Loading events...</span>
                           </div>
                        </TableCell>
                        </TableRow>
                     ) : error ? (
                        <TableRow>
                        <TableCell colSpan={11} className="h-32 text-center text-red-500">
                           {error}
                        </TableCell>
                        </TableRow>
                     ) : events.length === 0 ? (
                        <TableRow>
                        <TableCell colSpan={11} className="h-32 text-center text-(--text-secondary)">
                           No events found
                        </TableCell>
                        </TableRow>
                     ) : (
                        events.map((event, index) => (
                        <TableRow key={event.eventId}>
                           <TableCell>
                              <Checkbox
                              checked={selectedEvents.includes(event.eventId)}
                              onCheckedChange={() => toggleEventSelection(event.eventId)}
                              />
                           </TableCell>
                           <TableCell className="font-medium text-(--text-primary)">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                           </TableCell>
                           <TableCell className="font-medium text-(--text-primary)">{event.title}</TableCell>
                           <TableCell>{event.category}</TableCell>
                           <TableCell className="text-(--text-secondary)">
                              {formatDate2(event.startDateTime)}
                           </TableCell>
                           <TableCell className="text-(--text-secondary)">
                              {formatDate2(event.endDateTime)}
                           </TableCell>
                           <TableCell>
                              <Badge variant={event.format === "offline" ? "default" : "secondary"}>
                              {event.format.charAt(0).toUpperCase() + event.format.slice(1)}
                              </Badge>
                           </TableCell>
                           <TableCell>
                              <Badge variant={event.ticketType === "free" ? "success" : "default"}>
                              {event.ticketType === "free" ? "Free" : `₹${event.ticketPrice?.toLocaleString("en-IN") || 0}`}
                              </Badge>
                           </TableCell>
                           <TableCell className="text-(--text-primary) font-medium">
                              ₹{(event.grossTicketRevenue || 0).toLocaleString("en-IN")}
                           </TableCell>
                           <TableCell>
                              <Badge variant={getEventStatusBadgeVariant(event.eventStatus)}>
                              {event.eventStatus.charAt(0).toUpperCase() + event.eventStatus.slice(1)}
                              </Badge>
                           </TableCell>
                           <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => setViewEvent(event)}>
                                 <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setEditEvent(event)}>
                                 <Edit className="h-4 w-4" />
                              </Button>
                              {event.eventStatus !== "cancelled" && event.eventStatus !== "completed" && (
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-(--status-error)"
                                    onClick={() => setSuspendEvent(event)}
                                    disabled={suspendingEventId === event.eventId}
                                 >
                                    {suspendingEventId === event.eventId ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                    <Ban className="h-4 w-4" />
                                    )}
                                 </Button>
                              )}
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 className="text-(--status-error)"
                                 onClick={() => setDeleteEvent(event)}
                                 disabled={deletingEventId === event.eventId}
                              >
                                 {deletingEventId === event.eventId ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                 ) : (
                                    <Trash2 className="h-4 w-4" />
                                 )}
                              </Button>
                              </div>
                           </TableCell>
                        </TableRow>
                        ))
                     )}
                  </TableBody>
                  </Table>
               </div>
            </div>

            {/* Pagination */}
            {!loading && events.length > 0 && (
               <AdminPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalEvents}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
               />
            )}

            {/* View Event Modal */}
            <Modal isOpen={!!viewEvent} onClose={() => setViewEvent(null)} title="Event Details" size="lg">
               {viewEvent && <ViewEventModal event={viewEvent} />}
            </Modal>

            {/* Edit Event Modal */}
            <Modal isOpen={!!editEvent} onClose={() => setEditEvent(null)} title="Edit Event" size="lg">
               {editEvent && (
                  <div>Edit form goes here (create EditEventForm similar to UserManageForm)</div>
               )}
            </Modal>

            {/* Cancel Confirmation */}
            <ConfirmationModal
               isOpen={!!suspendEvent}
               onClose={() => setSuspendEvent(null)}
               onConfirm={() => handleSuspendEvent(suspendEvent!)}
               title="Suspend Event"
               description="Are you sure you want to suspend this event? Attendees will be notified."
               confirmText={suspendingEventId === suspendEvent?.eventId ? "Suspending..." : "Suspend Event"}
               variant="danger"
               loading={suspendingEventId === suspendEvent?.eventId}
            />

            {/* Delete Confirmation */}
            <ConfirmationModal
               isOpen={!!deleteEvent}
               onClose={() => setDeleteEvent(null)}
               onConfirm={() => handleDeleteEvent(deleteEvent!)}
               title="Delete Event"
               description="This action cannot be undone. All bookings and data will be permanently removed."
               confirmText={deletingEventId === deleteEvent?.eventId ? "Deleting..." : "Delete Event"}
               variant="danger"
               loading={deletingEventId === deleteEvent?.eventId}
            />
         </CardContent>
      </Card>
   );
}

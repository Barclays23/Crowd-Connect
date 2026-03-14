// frontend/src/components/admin/bookings-list.tsx
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Download,
  Eye,
  Ban,
  Loader2,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { bookingServices } from "@/services/bookingServices";
import { toast } from "react-toastify";
import { AdminPagination } from "./admin-pagination";
import { formatDate2 } from "@/utils/dateAndTimeFormats";
import { Modal } from "../ui/modal";
import { ConfirmationModal } from "./confirmation-modal";
import { LoadingSpinner1 } from "../common/LoadingSpinner1";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import {
  BOOKING_STATUS,
  type IBookingState,
  type BookingSortField,
  type GetBookingsApiResponse,
} from "@/types/booking.types";
import { getBookingStatusVariant } from "@/utils/UI.utils";
import { EVENT_FORMATS, EVENT_CATEGORIES, type EVENT_FORMAT } from "@/types/event.types";
import { capitalize } from "@/utils/namingConventions";
import BookingDetails from "@/components/booking/BookingDetails";
import { cancelReasonBase } from "@/schemas/booking.schema";
import { TextArea } from "@/components/ui/text-area";
import { FieldError } from "@/components/ui/FieldError";
import { canCancelBooking } from "@/utils/booking.utils";


export function BookingsList() {
   // Filters & UI state
   const [searchTerm, setSearchTerm] = useState("");
   const [statusFilter, setStatusFilter] = useState<"all" | BOOKING_STATUS>("all");
   const [formatFilter, setFormatFilter] = useState<"all" | EVENT_FORMAT>("all");
   const [currentPage, setCurrentPage] = useState(1);
   const [selectedBookings, setSelectedBookings] = useState<string[]>([]);

   // Sorting
   const [sortBy, setSortBy] = useState<BookingSortField>("createdAt");
   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

   // Data
   const [bookings, setBookings] = useState<IBookingState[]>([]);
   const [totalBookings, setTotalBookings] = useState(0);
   const [totalPages, setTotalPages] = useState(1);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   // Modals
   const [viewBooking, setViewBooking] = useState<IBookingState | null>(null);
   const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
   const [cancellingId, setCancellingId] = useState<string | null>(null);
   const [cancelReason, setCancelReason] = useState("");
   const [cancelError, setCancelError] = useState<string | null>(null);

   const itemsPerPage = 10;

   const [debouncedSearch, setDebouncedSearch] = useState("");
   useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedSearch(searchTerm);
         setCurrentPage(1);
      }, 500);
      return () => clearTimeout(timer);
   }, [searchTerm]);

   const fetchBookings = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
         const params = new URLSearchParams({
         page: currentPage.toString(),
         limit: itemsPerPage.toString(),
         sortBy,
         sortOrder,
         ...(debouncedSearch && { search: debouncedSearch }),
         ...(statusFilter !== "all" && { status: statusFilter }),
         ...(formatFilter !== "all" && { eventFormat: formatFilter }),
         });

         const response: GetBookingsApiResponse = await bookingServices.getAllBookings(params.toString());

         setBookings(response.bookingsData ?? []);
         setTotalBookings(response.pagination.totalCount ?? 0);
         setTotalPages(
         response.pagination.totalPages ??
            Math.ceil((response.pagination.totalCount ?? 0) / itemsPerPage)
         );
      } catch (error: unknown) {
         const errorMessage = getApiErrorMessage(error);
         if (errorMessage) toast.error(errorMessage);
         setError(errorMessage);
      } finally {
         setLoading(false);
      }
   }, [currentPage, debouncedSearch, statusFilter, formatFilter, sortBy, sortOrder]);

   useEffect(() => {
      fetchBookings();
   }, [fetchBookings]);

   useEffect(() => {
      setSelectedBookings([]);
   }, [currentPage, debouncedSearch, statusFilter, formatFilter, sortBy, sortOrder]);

   const toggleBookingSelection = (bookingId: string) => {
      setSelectedBookings((prev) =>
         prev.includes(bookingId) ? prev.filter((id) => id !== bookingId) : [...prev, bookingId]
      );
   };

   const toggleAllBookings = () => {
      setSelectedBookings((prev) =>
         prev.length === bookings.length && bookings.length > 0
         ? []
         : bookings.map((b) => b.bookingId)
      );
   };

   const nonCancellableStatuses = [
      BOOKING_STATUS.CANCELLED,
      BOOKING_STATUS.FAILED,
      BOOKING_STATUS.ATTENDED,
   ] as const;


   const handleCancelBooking = async () => {
      if (!cancelBookingId) return;

      const validation = cancelReasonBase.safeParse(cancelReason);
      if (!validation.success) {
         setCancelError(validation.error.issues[0].message);
         return;
      }

      try {
         setCancellingId(cancelBookingId);
         const response = await bookingServices.cancelBookingByAdmin(cancelBookingId, cancelReason);
         toast.success(response.message);
         setBookings((prev) =>
            prev.map((b) =>
               b.bookingId === cancelBookingId
                  ? { ...b, bookingStatus: BOOKING_STATUS.CANCELLED }
                  : b
            )
         );
      } catch (error: unknown) {
         const errorMessage = getApiErrorMessage(error);
         if (errorMessage) toast.error(errorMessage);

      } finally {
         setCancellingId(null);
         setCancelBookingId(null);
         setCancelReason("");
         setCancelError(null);
      }
   };

   const handleSort = (field: BookingSortField) => {
      if (sortBy === field) {
         setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
         setSortBy(field);
         setSortOrder("asc");
      }
      setCurrentPage(1);
   };

   const getSortIcon = (field: BookingSortField) => {
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
               <CardTitle className="text-2xl font-bold text-(--heading-primary)">Bookings</CardTitle>
               <p className="text-sm text-(--text-secondary) mt-1">
               Manage all platform bookings ({totalBookings} total)
               </p>
            </div>
         </div>
         </CardHeader>

         <CardContent className="p-6 bg-(--card-secondary)">
         {/* Filters */}
         <div className="flex flex-col lg:flex-row gap-4 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-62.5">
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-tertiary)" />
               <Input
               placeholder="Search by ticket number, event, user..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-11 h-11 border-(--border-muted) rounded-xl focus-visible:ring-2 focus-visible:ring-(--brand-primary-light)"
               />
            </div>

            <Select
               value={statusFilter}
               onValueChange={(v: "all" | BOOKING_STATUS) => {
                  setStatusFilter(v);
                  setCurrentPage(1);
               }}
            >
               <SelectTrigger className="w-44 h-11 rounded-xl border-(--border-muted)">
               <SelectValue placeholder="Status" />
               </SelectTrigger>
               <SelectContent>
               <SelectItem value="all">All Statuses</SelectItem>
               {Object.values(BOOKING_STATUS).map((s) => (
                  <SelectItem key={s} value={s}>
                     {capitalize(s)}
                  </SelectItem>
               ))}
               </SelectContent>
            </Select>

            <Select
               value={formatFilter}
               onValueChange={(v: "all" | EVENT_FORMAT) => {
                  setFormatFilter(v);
                  setCurrentPage(1);
               }}
            >
               <SelectTrigger className="w-40 h-11 rounded-xl border-(--border-muted)">
               <SelectValue placeholder="Format" />
               </SelectTrigger>
               <SelectContent>
               <SelectItem value="all">All Formats</SelectItem>
               <SelectItem value={EVENT_FORMATS.OFFLINE}>Offline</SelectItem>
               <SelectItem value={EVENT_FORMATS.ONLINE}>Online</SelectItem>
               </SelectContent>
            </Select>

            {selectedBookings.length > 0 && (
               <Button
               variant="outline"
               className="h-11 rounded-xl border-(--border-strong) hover:bg-(--bg-secondary)"
               >
               <Download className="h-4 w-4 mr-2" />
               Export CSV ({selectedBookings.length})
               </Button>
            )}
         </div>

         {/* Table */}
         <div className="relative">
            {loading && (
               <div className="absolute inset-0 z-10 flex items-center justify-center bg-(--bg-overlay)/50">
               <LoadingSpinner1 size="lg" message="Loading bookings..." />
               </div>
            )}

            <div className="rounded-xl border border-(--border-default) overflow-hidden bg-(--card-bg)">
               <Table>
               <TableHeader>
                  <TableRow className="bg-(--bg-tertiary) hover:bg-(--bg-tertiary)">
                     <TableHead className="w-12 h-12">
                     <Checkbox
                        checked={bookings.length > 0 && selectedBookings.length === bookings.length}
                        onCheckedChange={toggleAllBookings}
                        disabled={loading}
                     />
                     </TableHead>
                     <TableHead className="text-(--text-secondary) font-semibold">Sl No</TableHead>
                     <TableHead
                     className="text-(--text-secondary) font-semibold cursor-pointer"
                     onClick={() => handleSort("ticketNo")}
                     >
                     <div className="flex items-center">
                        Ticket
                        {getSortIcon("ticketNo")}
                     </div>
                     </TableHead>
                     <TableHead className="text-(--text-secondary) font-semibold">Event</TableHead>
                     <TableHead
                     className="text-(--text-secondary) font-semibold cursor-pointer"
                     onClick={() => handleSort("startDateTime")}
                     >
                     <div className="flex items-center">
                        Event Date
                        {getSortIcon("startDateTime")}
                     </div>
                     </TableHead>
                     <TableHead className="text-(--text-secondary) font-semibold">User</TableHead>
                     <TableHead>Category</TableHead>
                     <TableHead>Format</TableHead>
                     <TableHead
                     className="text-(--text-secondary) font-semibold cursor-pointer text-center"
                     onClick={() => handleSort("quantity")}
                     >
                     <div className="flex items-center justify-center">
                        Tickets
                        {getSortIcon("quantity")}
                     </div>
                     </TableHead>
                     <TableHead
                     className="text-(--text-secondary) font-semibold cursor-pointer"
                     onClick={() => handleSort("totalAmount")}
                     >
                     <div className="flex items-center">
                        Amount
                        {getSortIcon("totalAmount")}
                     </div>
                     </TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead className="text-right text-(--text-secondary) font-semibold">Actions</TableHead>
                  </TableRow>
               </TableHeader>

               <TableBody>
                  {loading ? (
                     <TableRow>
                     <TableCell colSpan={12} className="h-32 text-center">
                        <div className="flex items-center justify-center gap-2">
                           <Loader2 className="h-5 w-5 animate-spin" />
                           <span>Loading bookings...</span>
                        </div>
                     </TableCell>
                     </TableRow>
                  ) : error ? (
                     <TableRow>
                     <TableCell colSpan={12} className="h-32 text-center text-red-500">
                        {error}
                     </TableCell>
                     </TableRow>
                  ) : bookings.length === 0 ? (
                     <TableRow>
                     <TableCell colSpan={12} className="h-32 text-center text-(--text-secondary)">
                        No bookings found
                     </TableCell>
                     </TableRow>
                  ) : (
                     bookings.map((booking, index) => {
                        const isFree = booking.totalAmount === 0;
                        const isOnline = booking.event.format === EVENT_FORMATS.ONLINE;
                        const canCancel = canCancelBooking(booking);

                        return (
                           <TableRow key={booking.bookingId}>
                              <TableCell>
                              <Checkbox
                                 checked={selectedBookings.includes(booking.bookingId)}
                                 onCheckedChange={() => toggleBookingSelection(booking.bookingId)}
                              />
                              </TableCell>
                              <TableCell className="font-medium text-(--text-primary)">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                              </TableCell>

                              <TableCell>
                              <div className="space-y-0.5">
                                 <Badge variant="outline" className="font-mono text-xs">
                                    <Hash className="h-3 w-3 mr-1" />
                                    {booking.ticketNo}
                                 </Badge>
                              </div>
                              </TableCell>

                              <TableCell className="font-medium max-w-50 truncate">
                                 {booking.event.title}
                              </TableCell>

                              <TableCell className="text-(--text-secondary)">
                                 {formatDate2(booking.event.startDateTime)}
                              </TableCell>

                              <TableCell className="text-(--text-secondary)">
                                 {booking.user?.email}
                              </TableCell>

                              <TableCell>{booking.event.category ?? "—"}</TableCell>

                              <TableCell>
                              <Badge variant={isOnline ? "secondary" : "default"}>
                                 {isOnline ? "Online" : "Offline"}
                              </Badge>
                              </TableCell>

                              <TableCell className="text-center font-medium">
                                 {booking.quantity}
                              </TableCell>

                              <TableCell className="font-medium">
                              {isFree ? (
                                 <Badge variant="success">Free</Badge>
                              ) : (
                                 `₹${booking.totalAmount.toLocaleString("en-IN")}`
                              )}
                              </TableCell>

                              <TableCell>
                              <Badge variant={getBookingStatusVariant(booking.bookingStatus)}>
                                 {capitalize(booking.bookingStatus)}
                              </Badge>
                              </TableCell>

                              <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    title="View"
                                    onClick={() => setViewBooking(booking)}
                                 >
                                    <Eye className="h-4 w-4" />
                                 </Button>

                                 {canCancel && (
                                    <Button
                                       variant="ghost"
                                       size="icon"
                                       title="Cancel Booking"
                                       className="text-(--status-error)"
                                       onClick={() => {
                                          setCancelBookingId(booking.bookingId);
                                          setCancelReason("");
                                          setCancelError(null);
                                       }}
                                       disabled={cancellingId === booking.bookingId}
                                    >
                                    {cancellingId === booking.bookingId ? (
                                       <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                       <Ban className="h-4 w-4" />
                                    )}
                                    </Button>
                                 )}

                                 <Button variant="ghost" size="icon" title="Delete Booking" className="text-(--status-error)">
                                    <Trash2 className="h-4 w-4" />
                                 </Button>
                              </div>
                              </TableCell>
                           </TableRow>
                        );
                     })
                  )}
               </TableBody>
               </Table>
            </div>
         </div>

         {/* Pagination */}
         {!loading && bookings.length > 0 && (
            <AdminPagination
               currentPage={currentPage}
               totalPages={totalPages}
               totalItems={totalBookings}
               itemsPerPage={itemsPerPage}
               onPageChange={setCurrentPage}
            />
         )}

         {/* View Booking Modal */}
         <Modal
            isOpen={!!viewBooking}
            onClose={() => setViewBooking(null)}
            title="Booking Details"
            size="lg"
         >
            {viewBooking && <BookingDetails booking={viewBooking} />}
         </Modal>

         {/* Cancel Confirmation */}
         {/* Cancel Confirmation */}
         <ConfirmationModal
            isOpen={!!cancelBookingId}
            onClose={() => {
               setCancelBookingId(null);
               setCancelReason("");
               setCancelError(null);
            }}
            onConfirm={handleCancelBooking}
            title="Cancel Booking"
            description="This will cancel the booking and notify the user. Refunds (if applicable) will be processed according to policy."
            confirmText={cancellingId ? "Cancelling..." : "Cancel Booking"}
            variant="danger"
            loading={!!cancellingId}
            disableConfirm={!cancelReason.trim()}
         >
            <div className="mt-4 space-y-2 text-left">
               <label htmlFor="admin-cancel-reason" className="text-sm font-medium text-(--text-primary)">
                  Reason for cancellation <span className="text-(--status-error)">*</span>
               </label>
               <TextArea
                  id="admin-cancel-reason"
                  placeholder="Provide a reason for cancelling this booking..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  disabled={!!cancellingId}
                  className="w-full"
                  autoFocus
               />
               {cancelError && <FieldError message={cancelError} />}
            </div>
         </ConfirmationModal>
         </CardContent>
      </Card>
   );
}
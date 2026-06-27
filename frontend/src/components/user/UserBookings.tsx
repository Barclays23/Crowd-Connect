// frontend/src/components/user/UserBookings.tsx

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Hash,
  Ticket,
  Search,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge }    from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Modal }            from "@/components/ui/modal";
import { UserPagination }   from "@/components/user/UserPagination";
import { LoadingSpinner1 }  from "@/components/common/LoadingSpinner1";

import { bookingServices }     from "@/services/bookingServices";
import { getApiErrorMessage }  from "@/utils/errorMessages.utils";
import { formatDate2 }         from "@/utils/dateAndTimeFormats";
import { capitalize }          from "@/utils/namingConventions";
import { toast }               from "react-toastify";
import { ConfirmationModal }   from "@/components/admin/confirmation-modal";

import {
  type IBookingState,
  type BookingSortField,
  type GetMyBookingsResponse,
} from "@/types/booking.types";
import BookingDetails              from "@/components/booking/BookingDetails";
import { getBookingStatusVariant, getPaymentStatusVariant } from "@/utils/UI.utils";
import { TextArea } from "@/components/ui/text-area";
import { FieldError } from "@/components/ui/FieldError";
import { cancelReasonBase } from "@/schemas/booking.schema";
import { canCancelBooking } from "@/utils/booking.utils";
import { useAuth } from "@/contexts/AuthContext";
import { BOOKING_STATUS, type BookingStatus } from "@/constants/booking.constants";
import { EVENT_FORMATS, type EventFormat } from "@/constants/event.constants";
import { BookingModal } from "@/components/booking/BookingModal";




function UserBookings() {
  const [searchTerm,      setSearchTerm]      = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [formatFilter, setFormatFilter] = useState<"all" | EventFormat>("all");
  const [currentPage,     setCurrentPage]     = useState(1);
  const [sortBy,          setSortBy]          = useState<BookingSortField>("createdAt");
  const [sortOrder,       setSortOrder]       = useState<"asc" | "desc">("desc");

  const [bookings,      setBookings]      = useState<IBookingState[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalPages,    setTotalPages]    = useState(1);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);

  const [viewBooking,     setViewBooking]     = useState<IBookingState | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [isCancelling,    setIsCancelling]    = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [activeRetryBooking, setActiveRetryBooking] = useState<IBookingState | null>(null);

  const itemsPerPage = 10;


  const { user } = useAuth();
 


  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);



  const fetchMyBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: GetMyBookingsResponse = await bookingServices.getMyBookings({
        page:      currentPage,
        limit:     itemsPerPage,
        sortBy,
        sortOrder,
        ...(statusFilter    !== "all" && { status:      statusFilter }),
        ...(formatFilter !== "all" && { eventFormat: formatFilter }),
        ...(debouncedSearch           && { search:      debouncedSearch }),
      });

      setBookings(response.bookings ?? []);
      setTotalBookings(response.pagination.totalCount ?? 0);
      setTotalPages(
        response.pagination.totalPages ??
        Math.ceil((response.pagination.totalCount ?? 0) / itemsPerPage)
      );
    } catch (err: unknown) {
      const errorMessage = getApiErrorMessage(err);
      if (errorMessage) toast.error(errorMessage);
      setError(errorMessage ?? null);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, formatFilter, debouncedSearch, sortBy, sortOrder]);



  // const hasFetched = useRef(false);

  useEffect(() => {
    // if (hasFetched.current) return;
    // hasFetched.current = true;

    fetchMyBookings();
  }, [fetchMyBookings]);


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
    if (sortBy !== field) return <ArrowUpDown className="inline h-3.5 w-3.5 ml-1 opacity-50" />;
    return sortOrder === "asc"
      ? <ArrowUp   className="inline h-3.5 w-3.5 ml-1" />
      : <ArrowDown className="inline h-3.5 w-3.5 ml-1" />;
  };


  const requestCancel = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelReason("");
    setCancelError(null);
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!bookingToCancel) return;
    const validation = cancelReasonBase.safeParse(cancelReason);

    if (!validation.success) {
      setCancelError(validation.error.issues[0].message);
      return;
    }

    try {
      setIsCancelling(true);
      const response = await bookingServices.cancelBookingByUser(bookingToCancel, cancelReason);
      toast.success(response.message);
      fetchMyBookings();

    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error);
      console.log("error in confirm cancel booking", error);
      if (errorMessage) toast.error(errorMessage);

    } finally {
      setCancelModalOpen(false);
      setBookingToCancel(null);
      setCancelReason("");
      setCancelError(null);
      setIsCancelling(false);
    }
  };


  const hasActiveFilters = statusFilter !== "all" || formatFilter !== "all" || !!debouncedSearch;


  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            My Bookings ({totalBookings})
          </h2>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">

        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ticket number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            if (v === "all" || Object.values(BOOKING_STATUS).includes(v as BookingStatus)) {
              setStatusFilter(v as "all" | BookingStatus);
              setCurrentPage(1);
            }
          }}
        >
          <SelectTrigger className="w-44 h-10">
            <SelectValue placeholder="Booking Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value={BOOKING_STATUS.PENDING}>Pending</SelectItem>
            <SelectItem value={BOOKING_STATUS.CONFIRMED}>Confirmed</SelectItem>
            <SelectItem value={BOOKING_STATUS.ATTENDED}>Attended</SelectItem>
            <SelectItem value={BOOKING_STATUS.CANCELLED}>Cancelled</SelectItem>
            <SelectItem value={BOOKING_STATUS.FAILED}>Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={formatFilter}
          onValueChange={(v) => {
            if (v === "all" || v === EVENT_FORMATS.ONLINE || v === EVENT_FORMATS.OFFLINE) {
              setFormatFilter(v);
              setCurrentPage(1);
            }
          }}
        >
          <SelectTrigger className="w-36 h-10">
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All formats</SelectItem>
            <SelectItem value={EVENT_FORMATS.ONLINE}>Online</SelectItem>
            <SelectItem value={EVENT_FORMATS.OFFLINE}>In-Person</SelectItem>
          </SelectContent>
        </Select>

      </div>

      {/* Table */}
      <div className="rounded-lg bg-card relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
            <LoadingSpinner1 size="lg" message="Loading your bookings..." />
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("ticketNo")}
              >
                Ticket No {getSortIcon("ticketNo")}
              </TableHead>
              <TableHead>Event</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("startDateTime")}
              >
                Event Date {getSortIcon("startDateTime")}
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("ticketRate")}
              >
                Total Amount {getSortIcon("ticketRate")}
              </TableHead>
              <TableHead
                className="cursor-pointer text-center"
                onClick={() => handleSort("quantity")}
              >
                Tickets {getSortIcon("quantity")}
              </TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center pr-5">Manage</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} className="h-48 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <span className="text-muted-foreground">Loading...</span>
                </TableCell>
              </TableRow>

            ) : error ? (
              <TableRow>
                <TableCell colSpan={11} className="h-48 text-center text-destructive">
                  {error}
                </TableCell>
              </TableRow>

            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-48 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Ticket className="h-10 w-10 opacity-20" />
                    <p className="text-sm">No bookings found</p>
                    {/* FIX: empty state covers all three filters */}
                    {hasActiveFilters && (
                      <p className="text-xs">Try adjusting your filters</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>

            ) : (
              bookings.map((booking, idx) => {
                const isOnline  = booking.event.format === EVENT_FORMATS.ONLINE;
                const isFree    = booking.totalAmount === 0;
                const canCancel = canCancelBooking(booking);
                const isEventExpired = new Date(booking.event.endDateTime) < new Date();

                return (
                  <TableRow key={booking.bookingId}>

                    <TableCell className="font-medium">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </TableCell>

                    {/* Booking ID + ticket number */}
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs whitespace-nowrap">
                        <Hash className="h-2.5 w-2.5 mr-1" />
                        {booking.ticketNo}
                      </Badge>
                    </TableCell>

                    {/* Event name */}
                    <TableCell className="font-medium max-w-45">
                      <p className="truncate">{booking.event.title}</p>
                    </TableCell>

                    {/* Event start date */}
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {formatDate2(booking.event.startDateTime)}
                    </TableCell>

                    {/* Category */}
                    <TableCell className="">
                      {booking.event.category ?? "—"}
                    </TableCell>

                    {/* Venue */}
                    <TableCell className="text-muted-foreground max-w-55">
                      {isOnline
                        ? <Badge variant="secondary">Online</Badge>
                        : <span className="truncate block">{booking.event.locationName ?? "TBA"}</span>
                      }
                    </TableCell>

                    {/* Price */}
                    <TableCell className="font-medium">
                      {isFree
                        ? <Badge variant="default">Free</Badge>
                        : `₹${booking.totalAmount.toLocaleString("en-IN")}`
                      }
                    </TableCell>

                    {/* Ticket count */}
                    <TableCell className="text-center">
                      {booking.quantity}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <div className="flex flex-col gap-1.5 items-start">
                         <Badge variant={getBookingStatusVariant(booking.bookingStatus)}>
                           {capitalize(booking.bookingStatus)}
                         </Badge>
                         
                         {/* Mini badge for payment status */}
                         {!isFree && (
                          <span className="text-[10px] tracking-wider font-semibold text-(--text-tertiary)">
                            Payment: {capitalize(booking.payment.status)}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Action Buttons */}
                    <TableCell className="text-right pr-5">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="primaryOutline"
                          size="xs"
                          onClick={() => setViewBooking(booking)}
                        >
                          View
                        </Button>

                        {/* RETRY PAYMENT */}
                        {booking.bookingStatus === BOOKING_STATUS.PENDING && (
                          <Button
                            variant="default"
                            size="xs"
                            disabled={isEventExpired}
                            onClick={() => setActiveRetryBooking(booking)}
                            className={isEventExpired ? "opacity-50 cursor-not-allowed" : ""}
                          >
                            {isEventExpired ? "Expired" : "Retry Payment"}
                          </Button>
                        )}

                        {/* CANCEL BUTTON */}
                        {canCancel && booking.bookingStatus !== BOOKING_STATUS.PENDING && (
                          <Button
                            variant="destructive"
                            size="xs"
                            onClick={() => requestCancel(booking.bookingId)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>

                  </TableRow>
                );
              })
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

      {/* View Booking Modal */}
      <Modal
        isOpen={!!viewBooking}
        onClose={() => setViewBooking(null)}
        title="Booking Details"
        size="lg"
      >
        {viewBooking && <BookingDetails booking={viewBooking} />}
      </Modal>


      {/* RETRY CHECKOUT MODAL */}
      {activeRetryBooking && user && (
        <BookingModal
          isOpen={!!activeRetryBooking && !!user}
          onClose={() => setActiveRetryBooking(null)}
          user={user!}
          event={activeRetryBooking?.event || ({} as IBookingState["event"])}
          retryBooking={activeRetryBooking || undefined}
          onBooked={() => {
            setActiveRetryBooking(null);
            fetchMyBookings();
          }}
        />
      )}
   
      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setBookingToCancel(null);
          setCancelReason("");
          setCancelError(null);
        }}
        onConfirm={confirmCancel}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking? This action cannot be undone. If eligible, a refund will be processed within 5–7 business days."
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
        loadingText = "Cancelling..."
        variant="danger"
        loading={isCancelling}
        disableConfirm={!cancelReason.trim() || isCancelling}
      >
        <div className="mt-4 space-y-2">
          <label htmlFor="cancel-reason" className="text-sm font-medium text-(--text-primary)">
            Reason for cancellation <span className="text-(--status-error)">*</span>
          </label>
          <TextArea
            id="cancel-reason"
            placeholder="Please tell us why you are cancelling..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            disabled={isCancelling}
            className="w-full"
            autoFocus
          />
          {cancelError && <FieldError message={cancelError}/>}
        </div>
      </ConfirmationModal>
    </div>
  );
}

export default UserBookings;
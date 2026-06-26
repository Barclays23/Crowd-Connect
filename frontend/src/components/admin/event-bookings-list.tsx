// frontend/src/components/admin/event-bookings-list.tsx
import { useState, useEffect, useCallback } from "react";
import {
    Search, Eye, Ban, Loader2, Hash,
    ArrowUpDown, ArrowUp, ArrowDown, Users, Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { bookingServices } from "@/services/bookingServices";
import { toast } from "react-toastify";
import { AdminPagination } from "./admin-pagination";
import { formatDate2 } from "@/utils/dateAndTimeFormats";
import { Modal } from "../ui/modal";
import { ConfirmationModal } from "./confirmation-modal";
import { LoadingSpinner1 } from "../common/LoadingSpinner1";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import {
    type IBookingState,
    type BookingSortField,
    type GetBookingsApiResponse,
} from "@/types/booking.types";
import { getBookingStatusVariant } from "@/utils/UI.utils";
import { capitalize } from "@/utils/namingConventions";
import BookingDetails from "@/components/booking/BookingDetails";
import { cancelReasonBase } from "@/schemas/booking.schema";
import { TextArea } from "@/components/ui/text-area";
import { FieldError } from "@/components/ui/FieldError";
import { canCancelBooking } from "@/utils/booking.utils";
import { useAuth } from "@/contexts/AuthContext";
import { BOOKING_STATUS, type BookingStatus } from "@/constants/booking.constants";

interface EventBookingsListProps {
    eventId: string;
}


export function EventBookingsList({ eventId }: EventBookingsListProps) {
    const [searchTerm, setSearchTerm]           = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter]       = useState<"all" | BookingStatus>("all");
    const [currentPage, setCurrentPage]         = useState(1);
    const [sortBy, setSortBy]                   = useState<BookingSortField>("createdAt");
    const [sortOrder, setSortOrder]             = useState<"asc" | "desc">("desc");
    const [bookings, setBookings]               = useState<IBookingState[]>([]);
    const [totalBookings, setTotalBookings]     = useState(0);
    const [totalPages, setTotalPages]           = useState(1);
    const [loading, setLoading]                 = useState(true);
    const [error, setError]                     = useState<string | null>(null);
    const [viewBooking, setViewBooking]         = useState<IBookingState | null>(null);
    const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
    const [cancellingId, setCancellingId]       = useState<string | null>(null);
    const [cancelReason, setCancelReason]       = useState("");
    const [cancelError, setCancelError]         = useState<string | null>(null);

    const itemsPerPage = 10;

    const {user} = useAuth();

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(searchTerm); setCurrentPage(1); }, 500);
        return () => clearTimeout(t);
    }, [searchTerm]);


    const fetchBookingsListOfEvent = useCallback(async () => {
        setLoading(true); setError(null);

        try {
            const params = new URLSearchParams({
                // eventId, remove from here and pass as argument
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                sortBy, 
                sortOrder, 
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(statusFilter !== "all" && { status: statusFilter }),
            });
            const response: GetBookingsApiResponse = await bookingServices.getBookingsListOfEvent(eventId, params.toString());
            setBookings(response.bookingsData ?? []);
            setTotalBookings(response.pagination.totalCount ?? 0);
            setTotalPages(response.pagination.totalPages ?? Math.ceil((response.pagination.totalCount ?? 0) / itemsPerPage));
        } catch (err) {
            const msg = getApiErrorMessage(err);
            if (msg) toast.error(msg);
            setError(msg);
        } finally { setLoading(false); }
    }, [eventId, currentPage, debouncedSearch, statusFilter, sortBy, sortOrder]);

    useEffect(() => { 
        fetchBookingsListOfEvent();
    }, [fetchBookingsListOfEvent]);

    const handleCancelBooking = async () => {
        if (!cancelBookingId) return;
        const validation = cancelReasonBase.safeParse(cancelReason);
        if (!validation.success) { setCancelError(validation.error.issues[0].message); return; }
        try {
            setCancellingId(cancelBookingId);
            const res = await bookingServices.cancelBookingByAdmin(cancelBookingId, cancelReason);
            toast.success(res.message);
            setBookings(prev => prev.map(b => b.bookingId === cancelBookingId ? { ...b, bookingStatus: BOOKING_STATUS.CANCELLED } : b));
        } catch (err) {
            const msg = getApiErrorMessage(err);
            if (msg) toast.error(msg);
        } finally {
            setCancellingId(null); setCancelBookingId(null); setCancelReason(""); setCancelError(null);
        }
    };

    const handleSort = (field: BookingSortField) => {
        if (sortBy === field) setSortOrder(p => p === "asc" ? "desc" : "asc");
        else { setSortBy(field); setSortOrder("asc"); }
        setCurrentPage(1);
    };

    const SortIcon = ({ field }: { field: BookingSortField }) => {
        if (sortBy !== field) return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />;
        return sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5 ml-1" /> : <ArrowDown className="h-3.5 w-3.5 ml-1" />;
    };

    return (
        <div className="space-y-5">
            {/* Summary pills */}
            {!loading && (
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-(--bg-secondary) border border-(--card-border)">
                        <Users size={14} className="text-(--brand-primary)" />
                        <span className="text-xs font-semibold text-(--text-primary)">
                            {totalBookings} booking{totalBookings !== 1 ? "s" : ""}
                        </span>
                    </div>
                    {Object.values(BOOKING_STATUS).map(status => {
                        const count = bookings.filter(b => b.bookingStatus === status).length;
                        if (!count) return null;
                        return (
                            <Badge key={status} variant={getBookingStatusVariant(status)} className="text-xs">
                                {capitalize(status)}: {count}
                            </Badge>
                        );
                    })}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-tertiary)" />
                    <Input
                        placeholder="Search by ticket no, user email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 rounded-xl border-(--border-muted) bg-(--form-input-bg) text-(--form-input-text)"
                    />
                </div>
                <Select value={statusFilter} onValueChange={(v: "all" | BookingStatus) => { setStatusFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger className="w-40 h-10 rounded-xl border-(--border-muted)">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {Object.values(BOOKING_STATUS).map(s => (
                            <SelectItem key={s} value={s}>{capitalize(s)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="relative rounded-xl border border-(--card-border) overflow-hidden bg-(--card-bg)">
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-(--bg-overlay)/50 rounded-xl">
                        <LoadingSpinner1 size="lg" message="Loading bookings..." />
                    </div>
                )}
                <Table>
                    <TableHeader>
                        <TableRow className="bg-(--bg-tertiary) hover:bg-(--bg-tertiary)">
                            <TableHead className="text-(--text-secondary) font-semibold w-10">#</TableHead>
                            <TableHead className="text-(--text-secondary) font-semibold cursor-pointer" onClick={() => handleSort("ticketNo")}>
                                <div className="flex items-center">Ticket No <SortIcon field="ticketNo" /></div>
                            </TableHead>
                            <TableHead className="text-(--text-secondary) font-semibold">User</TableHead>
                            <TableHead className="text-(--text-secondary) font-semibold cursor-pointer" onClick={() => handleSort("createdAt")}>
                                <div className="flex items-center">Booked On <SortIcon field="createdAt" /></div>
                            </TableHead>
                            <TableHead className="text-(--text-secondary) font-semibold cursor-pointer text-center" onClick={() => handleSort("quantity")}>
                                <div className="flex items-center justify-center">Qty <SortIcon field="quantity" /></div>
                            </TableHead>
                            <TableHead className="text-(--text-secondary) font-semibold cursor-pointer" onClick={() => handleSort("totalAmount")}>
                                <div className="flex items-center">Total Amount <SortIcon field="totalAmount" /></div>
                            </TableHead>
                            <TableHead className="text-(--text-secondary) font-semibold">Status</TableHead>
                            <TableHead className="text-right text-(--text-secondary) font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center">
                                    <div className="flex items-center justify-center gap-2 text-(--text-tertiary)">
                                        <Loader2 className="h-5 w-5 animate-spin" /><span>Loading…</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-(--status-error)">{error}</TableCell>
                            </TableRow>
                        ) : bookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-40 text-center">
                                    <div className="flex flex-col items-center gap-3 text-(--text-tertiary)">
                                        <Ticket size={32} className="opacity-20" />
                                        <span className="text-sm">No bookings for this event yet</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            bookings.map((booking, index) => {
                                const isFree    = booking.totalAmount === 0;
                                const canCancel = canCancelBooking(booking);
                                return (
                                    <TableRow key={booking.bookingId} className="hover:bg-(--table-row-hover-bg) transition-colors">
                                        <TableCell className="text-(--text-tertiary) text-xs">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono text-xs truncate">
                                                <Hash className="h-3 w-3 mr-1" />{booking.ticketNo}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5 truncate">
                                                {booking.user?.name && (
                                                    <span className="text-sm font-medium text-(--text-primary)">{booking.user.name}</span>
                                                )}
                                                <span className="text-xs text-(--text-tertiary)">{booking.user?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-(--text-secondary)">{formatDate2(booking.createdAt)}</TableCell>
                                        <TableCell className="text-center font-semibold text-(--text-primary)">{booking.quantity}</TableCell>
                                        <TableCell className="font-medium text-(--text-primary)">
                                            {isFree ? <Badge variant="success">Free</Badge> : `₹${booking.totalAmount.toLocaleString("en-IN")}`}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getBookingStatusVariant(booking.bookingStatus)}>
                                                {capitalize(booking.bookingStatus)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" title="View booking" onClick={() => setViewBooking(booking)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {canCancel && (
                                                    <Button
                                                        variant="ghost" size="icon" title="Cancel booking"
                                                        className="text-(--status-error) hover:text-(--status-error)"
                                                        onClick={() => { setCancelBookingId(booking.bookingId); setCancelReason(""); setCancelError(null); }}
                                                        disabled={cancellingId === booking.bookingId}
                                                    >
                                                        {cancellingId === booking.bookingId
                                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                                            : <Ban className="h-4 w-4" />}
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

            {!loading && bookings.length > 0 && (
                <AdminPagination currentPage={currentPage} totalPages={totalPages} totalItems={totalBookings} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            )}

            {/* Details of a booking */}
            <Modal
                isOpen={!!viewBooking} 
                onClose={() => setViewBooking(null)} 
                title="Booking Details" 
                size="lg"
            >
                {viewBooking && <BookingDetails booking={viewBooking} />}
            </Modal>

            <ConfirmationModal
                isOpen={!!cancelBookingId}
                onClose={() => { setCancelBookingId(null); setCancelReason(""); setCancelError(null); }}
                onConfirm={handleCancelBooking}
                title="Cancel Booking"
                description="This will cancel the booking and notify the user. Refunds (if applicable) will be processed according to policy."
                confirmText={cancellingId ? "Cancelling…" : "Cancel Booking"}
                variant="danger" loading={!!cancellingId} disableConfirm={!cancelReason.trim()}
            >
                <div className="mt-4 space-y-2 text-left">
                    <label className="text-sm font-medium text-(--text-primary)">
                        Reason for cancellation <span className="text-(--status-error)">*</span>
                    </label>
                    <TextArea placeholder="Provide a reason for cancelling this booking..." value={cancelReason}
                        onChange={e => setCancelReason(e.target.value)} disabled={!!cancellingId} className="w-full" autoFocus />
                    {cancelError && <FieldError message={cancelError} />}
                </div>
            </ConfirmationModal>
        </div>
    );
}
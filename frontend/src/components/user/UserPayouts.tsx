// frontend/src/components/user/UserPayouts.tsx
import { useState, useEffect, useCallback, Fragment } from "react";
import {
    Loader2,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Clock,
    Wallet,
    PlusCircle,
    ChevronDown,
    ChevronUp,
    TrendingUp,
    Ticket,
    AlertTriangle,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { UserPagination } from "@/components/user/UserPagination";
import { LoadingSpinner1 } from "@/components/common/LoadingSpinner1";
import { toast } from "react-toastify";
import { formatDate2, formatDate5 } from "@/utils/dateAndTimeFormats";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { payoutServices } from "@/services/payoutServices";
import {
    type IPayoutState,
    type PayoutSortField,
    type PayoutSortDirection,
    PAYOUT_REQUEST_STATUSES,
    type GetPayoutsQueryParams,
} from "@/types/payout.types";
import { formatNumberToINR, formatNumberToINRWithDecimal } from "@/utils/UI.utils";
import { RequestPayoutModal } from "@/components/payout/request-payout-modal";
import { PAYOUT_STATUS_BADGE, PAYOUT_STATUS_ICON } from "@/components/ui-constants/payout-constants";
import { PayoutStatCard } from "@/components/admin/payout/payout-stat-card";
import type { ApiResponse } from "@/types/common.types";



export default function UserPayouts() {
    const [payouts, setPayouts]           = useState<IPayoutState[]>([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState<string | null>(null);

    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy]             = useState<PayoutSortField>("requestedAt");
    const [sortOrder, setSortOrder]       = useState<PayoutSortDirection>("desc");

    const [currentPage, setCurrentPage]   = useState(1);
    const [totalPayouts, setTotalPayouts] = useState(0);
    const [totalPages, setTotalPages]     = useState(1);
    const itemsPerPage = 10;

    const [requestModalOpen, setRequestModalOpen] = useState(false);
    const [expandedRow, setExpandedRow]           = useState<string | null>(null);

    const fetchPayouts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params: GetPayoutsQueryParams = {
                page     : currentPage,
                limit    : itemsPerPage,
                sortBy,
                sortOrder,
                ...(statusFilter !== "all" && { status: statusFilter }),
            };

            const response: ApiResponse<IPayoutState[]> = await payoutServices.getMyPayouts(params);

            setPayouts(response.data ?? []);
            setTotalPayouts(response.pagination?.totalCount ?? 0);
            setTotalPages(response.pagination?.totalPages ?? 1);
            
        } catch (error: unknown) {
            const errorMessages = getApiErrorMessage(error);
            if (errorMessages) {
                toast.error(errorMessages);
                setError(errorMessages);
            }
        } finally {
            setLoading(false);
        }
    }, [currentPage, statusFilter, sortBy, sortOrder]);

    useEffect(() => { fetchPayouts(); }, [fetchPayouts]);

    const handleSort = (field: PayoutSortField) => {
        if (sortBy === field) setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
        else { setSortBy(field); setSortOrder("asc"); }
        setCurrentPage(1);
    };

    const SortIcon = ({ field }: { field: PayoutSortField }) => {
        if (sortBy !== field) return <ArrowUpDown className="inline h-3.5 w-3.5 ml-1 opacity-50 text-(--text-tertiary)" />;
        return sortOrder === "asc"
            ? <ArrowUp   className="inline h-3.5 w-3.5 ml-1 text-(--text-primary)" />
            : <ArrowDown className="inline h-3.5 w-3.5 ml-1 text-(--text-primary)" />;
    };

    const totalEarned  = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.netAmount, 0);
    const totalPending = payouts.filter((p) => p.status === "pending").length;

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                <h2 className="text-2xl font-bold tracking-tight text-(--text-primary)">Payout Requests</h2>
                <p className="text-(--text-secondary) mt-1">
                    Request and track earnings from your completed events
                </p>
                </div>
                <Button
                    onClick={() => setRequestModalOpen(true)}
                    className="gap-2 self-start sm:self-auto bg-(--btn-primary-bg) text-(--btn-primary-text) hover:bg-(--btn-primary-hover)"
                >
                    <PlusCircle className="h-4 w-4" />
                    New Payout Request
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <PayoutStatCard
                    icon={<Wallet    className="h-3.5 w-3.5" />}
                    label="Paid (This Page)"
                    value={formatNumberToINR(totalEarned)}
                    sub="credited to wallet"
                />
                <PayoutStatCard
                    icon={<Clock     className="h-3.5 w-3.5" />}
                    label="Pending (This Page)"
                    value={totalPending.toString()}
                    sub="awaiting admin review"
                />
                <PayoutStatCard
                    icon={<TrendingUp className="h-3.5 w-3.5" />}
                    label="Total Requests"
                    value={totalPayouts.toString()}
                    sub="all time"
                />
                <PayoutStatCard
                    icon={<Ticket    className="h-3.5 w-3.5" />}
                    label="Success (This Page)"
                    value={
                        payouts.length > 0
                            ? `${Math.round((payouts.filter((p) => p.status === "paid").length / payouts.length) * 100)}%`
                            : "—"
                    }
                    sub="approved / total shown"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-44 h-10 border-(--form-border) bg-(--form-bg) text-(--text-primary)">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-lg bg-(--table-bg) relative">
                {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-(--bg-overlay) backdrop-blur-sm rounded-lg">
                    <LoadingSpinner1 size="lg" message="Loading payouts..." />
                </div>
                )}

                <Table>
                <TableHeader>
                    <TableRow className="border-(--table-border) hover:bg-transparent">
                        <TableHead className="w-10 text-(--table-header-text)">#</TableHead>
                        <TableHead className="text-(--table-header-text)">Event</TableHead>
                        <TableHead
                            className="cursor-pointer text-(--table-header-text)"
                            onClick={() => handleSort("grossAmount")}
                        >
                            Gross Revenue<SortIcon field="grossAmount" />
                        </TableHead>
                        <TableHead className="text-(--table-header-text)">Platform Fee</TableHead>
                        <TableHead
                            className="cursor-pointer text-(--table-header-text)"
                            onClick={() => handleSort("netAmount")}
                        >
                            Net Payout <SortIcon field="netAmount" />
                        </TableHead>
                        <TableHead
                            className="cursor-pointer text-(--table-header-text)"
                            onClick={() => handleSort("status")}
                        >
                            Status <SortIcon field="status" />
                        </TableHead>
                        <TableHead
                            className="cursor-pointer text-(--table-header-text)"
                            onClick={() => handleSort("requestedAt")}
                        >
                            Requested <SortIcon field="requestedAt" />
                        </TableHead>
                        <TableHead className="w-10 text-right pr-4 text-(--table-header-text)" />
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {loading ? (
                        <TableRow className="border-(--table-border)">
                            <TableCell colSpan={8} className="h-48 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-(--text-secondary)" />
                            </TableCell>
                        </TableRow>
                    ) : error ? (
                        <TableRow className="border-(--table-border)">
                            <TableCell colSpan={8} className="h-48 text-center text-(--status-error)">{error}</TableCell>
                        </TableRow>
                    ) : payouts.length === 0 ? (
                        <TableRow className="border-(--table-border)">
                            <TableCell colSpan={8} className="h-48 text-center">
                            <div className="flex flex-col items-center gap-3 text-(--text-tertiary)">
                                <Wallet className="h-10 w-10 opacity-30" />
                                <p>No payout requests yet</p>
                                <Button variant="outline" size="sm" onClick={() => setRequestModalOpen(true)}>
                                    <PlusCircle className="h-4 w-4 mr-2" /> Make your first request
                                </Button>
                            </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        payouts.map((payout, idx) => {
                            // Calculate attendance dynamically
                            const attendanceRate = payout.ticketsSold > 0 
                                ? Math.round((payout.checkedInCount / payout.ticketsSold) * 100) 
                                : 0;

                            return (
                            <Fragment key={payout.payoutId}>
                                <TableRow
                                    className="cursor-pointer border-(--table-row-border) hover:bg-(--table-row-hover)"
                                    onClick={() => setExpandedRow(expandedRow === payout.payoutId ? null : payout.payoutId)}
                                >
                                    <TableCell className="font-medium text-(--text-primary)">
                                        {(currentPage - 1) * itemsPerPage + idx + 1}
                                    </TableCell>
                                    <TableCell className="font-medium max-w-45 truncate text-(--text-primary)">
                                        {payout.eventTitle}
                                    </TableCell>
                                    <TableCell className="text-(--text-secondary) text-right pr-10">
                                        {formatNumberToINRWithDecimal(payout.grossAmount)}
                                    </TableCell>
                                    <TableCell className="text-(--status-error) text-right pr-10 font-medium">
                                        − {formatNumberToINRWithDecimal(payout.commissionAmount)}
                                    </TableCell>
                                    <TableCell className="font-semibold text-(--status-success) text-right pr-10">
                                        {formatNumberToINRWithDecimal(payout.netAmount)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={PAYOUT_STATUS_BADGE[payout.status]} className="gap-1 capitalize">
                                            {PAYOUT_STATUS_ICON[payout.status]}
                                            {payout.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-(--text-secondary) text-sm">
                                        {formatDate2(payout.requestedAt)}
                                    </TableCell>
                                    <TableCell className="text-right pr-4">
                                        {expandedRow === payout.payoutId
                                            ? <ChevronUp   className="h-4 w-4 text-(--text-tertiary)" />
                                            : <ChevronDown className="h-4 w-4 text-(--text-tertiary)" />
                                        }
                                    </TableCell>
                                </TableRow>

                                {/* Expanded detail row */}
                                {expandedRow === payout.payoutId && (
                                    <TableRow className="bg-(--table-row-even-bg) hover:bg-(--table-row-even-bg)">
                                        <TableCell colSpan={8} className="px-6 py-5 border-b border-(--table-border)">
                                            
                                            {/* Grid layout expanded to accommodate Check-ins & Attendance */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-sm">
                                                <div>
                                                    <p className="text-xs text-(--text-tertiary) mb-1 uppercase tracking-wider font-semibold">Tickets Sold</p>
                                                    <p className="font-medium text-(--text-primary)">{payout.ticketsSold}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-(--text-tertiary) mb-1 uppercase tracking-wider font-semibold">Checked In</p>
                                                    <p className="font-medium text-(--text-primary)">{payout.checkedInCount}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-(--text-tertiary) mb-1 uppercase tracking-wider font-semibold">Attendance</p>
                                                    <p className={`font-medium ${attendanceRate < 30 ? "text-(--status-error)" : "text-(--status-success)"}`}>
                                                        {attendanceRate}%
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-(--text-tertiary) mb-1 uppercase tracking-wider font-semibold">Platform Fee</p>
                                                    <p className="font-medium text-(--text-primary)">{(payout.commissionRate * 100).toFixed(0)}%</p>
                                                </div>
                                                {payout.requestedAt && (
                                                    <div>
                                                        <p className="text-xs text-(--text-tertiary) mb-1 uppercase tracking-wider font-semibold">Requested At</p>
                                                        <p className="font-medium text-(--text-primary)">{formatDate5(payout.requestedAt)}</p>
                                                    </div>
                                                )}
                                                {payout.reviewedAt && (
                                                    <div>
                                                        <p className="text-xs text-(--text-tertiary) mb-1 uppercase tracking-wider font-semibold">
                                                            {payout.status === PAYOUT_REQUEST_STATUSES.PAID ? "Paid At" : "Reviewed At"}
                                                        </p>
                                                        <p className={`font-medium ${payout.status === PAYOUT_REQUEST_STATUSES.PAID ? "text-(--status-success)" : "text-(--text-primary)"}`}>
                                                            {formatDate5(payout.reviewedAt)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Rejection Reason Block */}
                                            {payout.status === PAYOUT_REQUEST_STATUSES.REJECTED && payout.rejectionReason && (
                                                <div className="mt-4 pt-4 border-t border-(--border-muted)">
                                                    <p className="text-xs text-(--text-tertiary) mb-1.5 uppercase tracking-wider font-semibold">Rejection Reason</p>
                                                    <div className="flex items-start gap-2 rounded-lg p-3 bg-(--badge-error-bg) border border-(--badge-error-border)">
                                                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-(--badge-error-text)" />
                                                        <p className="text-sm text-(--badge-error-text)">{payout.rejectionReason}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Proof Images Block */}
                                            {payout.proofUrls && payout.proofUrls.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-(--border-muted)">
                                                    <p className="text-xs text-(--text-tertiary) mb-1.5 uppercase tracking-wider font-semibold">Proof Images</p>
                                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                                        {payout.proofUrls.map((url, i) => (
                                                            <a
                                                                key={i}
                                                                href={url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-md border border-(--border-muted) overflow-hidden group block"
                                                                title="Click to view full size"
                                                            >
                                                                <img 
                                                                    src={url} 
                                                                    alt={`proof-${i}`} 
                                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                                                                />
                                                                <div className="absolute inset-0 bg-transparent group-hover:bg-(--image-overlay) transition-colors flex items-center justify-center">
                                                                    <Eye className="text-(--overlay-text) opacity-0 group-hover:opacity-100 w-5 h-5 drop-shadow-md" />
                                                                </div>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                        </TableCell>
                                    </TableRow>
                                )}
                            </Fragment>
                        );
                        })
                    )}
                </TableBody>
                </Table>
            </div>

            <UserPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            <RequestPayoutModal
                isOpen={requestModalOpen}
                onClose={() => setRequestModalOpen(false)}
                onRequested={fetchPayouts}
            />
        </div>
    );
}
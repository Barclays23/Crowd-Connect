// frontend/src/components/user/UserPayouts.tsx
import { useState, useEffect, useCallback, Fragment } from "react";
import {
   Loader2,
   ArrowUpDown,
   ArrowUp,
   ArrowDown,
   BadgeCheck,
   Clock,
   Ban,
   Wallet,
   PlusCircle,
   ChevronDown,
   ChevronUp,
   TrendingUp,
   Ticket,
   AlertTriangle,
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
import { formatDate1, formatDate2 } from "@/utils/dateAndTimeFormats";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { payoutServices } from "@/services/payoutServices";
import {
   type IPayoutRequest,
   type PayoutSortField,
   type PayoutSortDirection,
   type PayoutRequestStatus,
   PAYOUT_REQUEST_STATUSES,
} from "@/types/payout.types";
import { formatNumberToINR } from "@/utils/UI.utils";
import { RequestPayoutModal } from "@/components/payout/request-payout-modal";




// ── Badge helpers ──────────────────────────────────────────────────────────────

const PAYOUT_STATUS_BADGE: Record<PayoutRequestStatus, "default" | "secondary" | "success" | "destructive" | "outline"> = {
    pending  : "secondary",
    approved : "success",
    paid     : "success",
    rejected : "destructive",
};

const PAYOUT_STATUS_ICON: Record<PayoutRequestStatus, React.ReactNode> = {
    pending  : <Clock className="h-3 w-3"   />,
    approved : <BadgeCheck className="h-3 w-3" />,
    paid     : <Wallet className="h-3 w-3"  />,
    rejected : <Ban className="h-3 w-3"     />,
};



// ── Summary stat card ──────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
    return (
        <div className="rounded-xl p-4 flex flex-col gap-1.5 bg-(--bg-secondary) border border-(--card-border)">
            <div className="flex items-center gap-1.5 text-(--brand-primary) text-[11px] font-bold uppercase tracking-[0.08em]">
                {icon} {label}
            </div>
            <div className="text-lg font-extrabold text-(--text-primary)">{value}</div>
            {sub && <div className="text-xs text-(--text-tertiary)">{sub}</div>}
        </div>
    );
}




export default function UserPayouts() {
    const [payouts, setPayouts]           = useState<IPayoutRequest[]>([]);
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
            const params = new URLSearchParams({
                page     : currentPage.toString(),
                limit    : itemsPerPage.toString(),
                sortBy,
                sortOrder,
                ...(statusFilter !== "all" && { status: statusFilter }),
            });
            const res = await payoutServices.getMyPayouts(params.toString());
            setPayouts(res.payouts ?? []);
            setTotalPayouts(res.pagination.totalCount ?? 0);
            setTotalPages(res.pagination.totalPages ?? 1);
            
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
        if (sortBy !== field) return <ArrowUpDown className="inline h-3.5 w-3.5 ml-1 opacity-50" />;
        return sortOrder === "asc"
            ? <ArrowUp   className="inline h-3.5 w-3.5 ml-1" />
            : <ArrowDown className="inline h-3.5 w-3.5 ml-1" />;
    };

    // Derived summary stats
    const totalEarned  = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.netAmount, 0);
    const totalPending = payouts.filter((p) => p.status === "pending").length;

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                <h2 className="text-2xl font-bold tracking-tight">Payout Requests</h2>
                <p className="text-muted-foreground mt-1">
                    Request and track earnings from your completed events
                </p>
                </div>
                <Button
                    onClick={() => setRequestModalOpen(true)}
                    className="gap-2 self-start sm:self-auto"
                >
                    <PlusCircle className="h-4 w-4" />
                    New Payout Request
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                    icon={<Wallet    className="h-3.5 w-3.5" />}
                    label="Total Paid Out"
                    value={formatNumberToINR(totalEarned)}
                    sub="credited to wallet"
                />
                <StatCard
                    icon={<Clock     className="h-3.5 w-3.5" />}
                    label="Pending"
                    value={totalPending.toString()}
                    sub="awaiting admin review"
                />
                <StatCard
                    icon={<TrendingUp className="h-3.5 w-3.5" />}
                    label="Total Requests"
                    value={totalPayouts.toString()}
                    sub="all time"
                />
                <StatCard
                    icon={<Ticket    className="h-3.5 w-3.5" />}
                    label="Success Rate"
                    value={
                        totalPayouts > 0
                            ? `${Math.round((payouts.filter((p) => p.status === "paid").length / totalPayouts) * 100)}%`
                            : "—"
                    }
                    sub="approved / total"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-44 h-10">
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
            <div className="rounded-lg bg-card relative">
                {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
                    <LoadingSpinner1 size="lg" message="Loading payouts..." />
                </div>
                )}

                <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("grossAmount")}
                        >
                            Gross Revenue<SortIcon field="grossAmount" />
                        </TableHead>
                        <TableHead>Platform Fee</TableHead>
                        <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("netAmount")}
                        >
                            Net Payout <SortIcon field="netAmount" />
                        </TableHead>
                        <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("status")}
                        >
                            Status <SortIcon field="status" />
                        </TableHead>
                        <TableHead
                            className="cursor-pointer"
                            onClick={() => handleSort("requestedAt")}
                        >
                            Requested <SortIcon field="requestedAt" />
                        </TableHead>
                        <TableHead className="w-10 text-right pr-4" />
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-48 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                            </TableCell>
                        </TableRow>
                    ) : error ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-48 text-center text-destructive">{error}</TableCell>
                        </TableRow>
                    ) : payouts.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-48 text-center">
                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                <Wallet className="h-10 w-10 opacity-30" />
                                <p>No payout requests yet</p>
                                <Button variant="outline" size="sm" onClick={() => setRequestModalOpen(true)}>
                                    <PlusCircle className="h-4 w-4 mr-2" /> Make your first request
                                </Button>
                            </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        payouts.map((payout, idx) => (
                            <Fragment key={payout.payoutId}>
                                <TableRow
                                    key={payout.payoutId}
                                    className="cursor-pointer"
                                    onClick={() => setExpandedRow(expandedRow === payout.payoutId ? null : payout.payoutId)}
                                >
                                    <TableCell className="font-medium">
                                        {(currentPage - 1) * itemsPerPage + idx + 1}
                                    </TableCell>
                                    <TableCell className="font-medium max-w-45 truncate">
                                        {payout.eventTitle}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatNumberToINR(payout.grossAmount)}
                                    </TableCell>
                                    <TableCell className="text-destructive text-sm">
                                        − {formatNumberToINR(payout.commissionAmount)}
                                    </TableCell>
                                    <TableCell className="font-semibold text-(--status-success)">
                                        {formatNumberToINR(payout.netAmount)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={PAYOUT_STATUS_BADGE[payout.status]} className="gap-1 capitalize">
                                            {PAYOUT_STATUS_ICON[payout.status]}
                                            {payout.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {formatDate2(payout.requestedAt)}
                                    </TableCell>
                                    <TableCell className="text-right pr-4">
                                        {expandedRow === payout.payoutId
                                            ? <ChevronUp   className="h-4 w-4 text-muted-foreground" />
                                            : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        }
                                    </TableCell>
                                </TableRow>

                                {/* Expanded detail row */}
                                {expandedRow === payout.payoutId && (
                                    <TableRow key={`${payout.payoutId}-detail`} className="bg-(--bg-secondary) hover:bg-(--bg-secondary)">
                                        <TableCell colSpan={8} className="px-6 py-4">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-0.5">Tickets Sold</p>
                                                <p className="font-semibold">{payout.ticketsSold}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-0.5">Commission Rate</p>
                                                <p className="font-semibold">{(payout.commissionRate * 100).toFixed(0)}%</p>
                                            </div>
                                            {payout.reviewedAt && (
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-0.5">Reviewed At</p>
                                                    <p className="font-semibold">{formatDate1(payout.reviewedAt)}</p>
                                                </div>
                                            )}
                                            {payout.reviewedAt && (
                                                    <div>
                                                        <p className="text-xs text-muted-foreground mb-0.5">
                                                            {payout.status === PAYOUT_REQUEST_STATUSES.PAID ? "Paid At" : "Reviewed At"}
                                                        </p>
                                                        <p className={`font-semibold ${payout.status === PAYOUT_REQUEST_STATUSES.PAID ? "text-(--status-success)" : ""}`}>
                                                            {formatDate1(payout.reviewedAt)}
                                                        </p>
                                                    </div>
                                                )}
                                            {payout.status === PAYOUT_REQUEST_STATUSES.REJECTED && payout.rejectionReason && (
                                                <div className="col-span-2 sm:col-span-4">
                                                    <p className="text-xs text-muted-foreground mb-1">Rejection Reason</p>
                                                    <div className="flex items-start gap-2 rounded-lg p-3 bg-(--badge-danger-bg) border border-(--border-brand)">
                                                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
                                                        <p className="text-sm text-(--badge-danger-text)">{payout.rejectionReason}</p>
                                                    </div>
                                                </div>
                                            )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </Fragment>
                        ))
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
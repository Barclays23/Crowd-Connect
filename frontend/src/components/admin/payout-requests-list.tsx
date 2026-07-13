// frontend/src/components/admin/payout-requests-list.tsx
import { useState, useEffect, useCallback } from "react";
import {
   Search,
   Loader2,
   ArrowUpDown,
   ArrowUp,
   ArrowDown,
   Clock,
   Wallet,
   Eye,
   CheckCircle2,
   XCircle,
   TrendingUp,
   IndianRupee,
   Users,
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
import { Modal } from "@/components/ui/modal";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { LoadingSpinner1 } from "@/components/common/LoadingSpinner1";
import { toast } from "react-toastify";
import { formatDate2 } from "@/utils/dateAndTimeFormats";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { payoutServices } from "@/services/payoutServices";
import type {
   IPayoutState,
   PayoutSortField,
   PayoutSortDirection,
   GetPayoutsQueryParams,
} from "@/types/payout.types";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { formatNumberToINR, formatNumberToINRWithDecimal } from "@/utils/UI.utils";

import { PayoutStatCard } from "./payout/payout-stat-card";
import { PayoutDetailModal } from "./payout/payout-detail-modal";
import { PayoutRejectModal } from "./payout/payout-reject-modal";
import { PAYOUT_STATUS_BADGE, PAYOUT_STATUS_ICON } from "@/components/ui-constants/payout-constants";
import type { ApiResponse } from "@/types/common.types";


export function PayoutRequestsList() {
    const [payouts, setPayouts]           = useState<IPayoutState[]>([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState<string | null>(null);

    const [searchTerm, setSearchTerm]     = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("pending");
    const [sortBy, setSortBy]             = useState<PayoutSortField>("requestedAt");
    const [sortOrder, setSortOrder]       = useState<PayoutSortDirection>("desc");

    const [currentPage, setCurrentPage]   = useState(1);
    const [totalPayouts, setTotalPayouts] = useState(0);
    const [totalPages, setTotalPages]     = useState(1);
    const itemsPerPage = 10;

    const [viewPayout, setViewPayout]     = useState<IPayoutState | null>(null);

    const [approveTarget, setApproveTarget] = useState<IPayoutState | null>(null);
    const [isApproving, setIsApproving]     = useState(false);

    const [rejectTarget, setRejectTarget]   = useState<IPayoutState | null>(null);
    const [isRejecting, setIsRejecting]     = useState(false);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(searchTerm); setCurrentPage(1); }, 500);
        return () => clearTimeout(t);
    }, [searchTerm]);

    const fetchPayouts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params: GetPayoutsQueryParams = {
                page     : currentPage,
                limit    : itemsPerPage,
                sortBy,
                sortOrder,
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(statusFilter !== "all" && { status: statusFilter }),
            };

            const response: ApiResponse<IPayoutState[]> = await payoutServices.getAllPayouts(params);

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
    }, [currentPage, debouncedSearch, statusFilter, sortBy, sortOrder]);

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

    // ── Approve ──────────────────────────────────────────────────────────────────
    const confirmApprove = async () => {
        if (!approveTarget) return;
        setIsApproving(true);

        try {
            const res: ApiResponse<IPayoutState> = await payoutServices.reviewPayout(approveTarget.payoutId, { action: "approve" });
            toast.success(res.message);
            fetchPayouts();

        } catch (error: unknown) {
            const errorMessages = getApiErrorMessage(error);
            if (errorMessages) {
                toast.error(errorMessages);
                setError(errorMessages);
            }
        } finally {
            setIsApproving(false);
            setApproveTarget(null);
        }
    };

    // ── Reject ───────────────────────────────────────────────────────────────────
    const confirmReject = async (reason: string) => {
        if (!rejectTarget || !reason.trim()) return;
        setIsRejecting(true);

        try {
            const res: ApiResponse<IPayoutState> = await payoutServices.reviewPayout(rejectTarget.payoutId, { action: "reject", rejectionReason: reason });
            toast.success(res.message);
            fetchPayouts();
            
        } catch (error: unknown) {
            const errorMessages = getApiErrorMessage(error);
            if (errorMessages) {
                toast.error(errorMessages);
                setError(errorMessages);
            }
        } finally {
            setIsRejecting(false);
            setRejectTarget(null);
        }
    };

    const pendingTotal  = payouts.filter((p) => p.status === "pending").reduce((s, p) => s + p.netAmount, 0);
    const approvedTotal = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.netAmount, 0);

    return (
        <div className="space-y-6">

            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <PayoutStatCard icon={<Clock       className="h-3.5 w-3.5" />} label="Pending Value"   value={formatNumberToINR(pendingTotal)}  sub="awaiting review" />
                <PayoutStatCard icon={<Wallet      className="h-3.5 w-3.5" />} label="Total Paid Out"  value={formatNumberToINR(approvedTotal)} sub="credited to hosts" />
                <PayoutStatCard icon={<TrendingUp  className="h-3.5 w-3.5" />} label="Total Requests"  value={totalPayouts.toString()}  sub="all time" />
                <PayoutStatCard icon={<IndianRupee className="h-3.5 w-3.5" />} label="Commission Earned"
                    value={formatNumberToINR(payouts.filter(p => p.status === "paid").reduce((s, p) => s + p.commissionAmount, 0))}
                    sub="10% platform fee"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--text-tertiary)" />
                <Input
                    placeholder="Search by event or host name…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 border-(--form-border) bg-(--form-bg)"
                />
                </div>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger className="w-44 h-10 border-(--form-border) bg-(--form-bg)">
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
                    <LoadingSpinner1 size="lg" message="Loading payout requests…" />
                </div>
                )}

                <Table>
                    <TableHeader>
                        <TableRow className="border-(--table-border) hover:bg-transparent">
                            <TableHead className="w-10 text-(--table-header-text)">#</TableHead>
                            <TableHead className="text-(--table-header-text)">Event</TableHead>
                            <TableHead className="text-(--table-header-text)">
                                <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" /> Host
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer text-(--table-header-text)" onClick={() => handleSort("grossAmount")}>
                                Gross <SortIcon field="grossAmount" />
                            </TableHead>
                            <TableHead className="text-(--table-header-text)">Commission</TableHead>
                            <TableHead className="cursor-pointer text-(--table-header-text)" onClick={() => handleSort("netAmount")}>
                                Net Payout <SortIcon field="netAmount" />
                            </TableHead>
                            <TableHead className="cursor-pointer text-(--table-header-text)" onClick={() => handleSort("status")}>
                                Status <SortIcon field="status" />
                            </TableHead>
                            <TableHead className="cursor-pointer text-(--table-header-text)" onClick={() => handleSort("requestedAt")}>
                                Requested <SortIcon field="requestedAt" />
                            </TableHead>
                            <TableHead className="text-right pr-5 text-(--table-header-text)">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            <TableRow className="border-(--table-border)">
                                <TableCell colSpan={9} className="h-48 text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-(--text-secondary)" />
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow className="border-(--table-border)">
                                <TableCell colSpan={9} className="h-48 text-center text-(--status-error)">{error}</TableCell>
                            </TableRow>
                        ) : payouts.length === 0 ? (
                            <TableRow className="border-(--table-border)">
                                <TableCell colSpan={9} className="h-48 text-center">
                                <div className="flex flex-col items-center gap-2 text-(--text-tertiary)">
                                    <Wallet className="h-10 w-10 opacity-50" />
                                    <p>No payout requests found</p>
                                </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            payouts.map((payout, idx) => (
                                <TableRow key={payout.payoutId} className="border-(--table-row-border) hover:bg-(--table-row-hover)">
                                <TableCell className="font-medium text-(--text-primary)">
                                    {(currentPage - 1) * itemsPerPage + idx + 1}
                                </TableCell>
                                <TableCell className="font-medium max-w-40 truncate text-(--text-primary)" title={payout.eventTitle}>
                                    {payout.eventTitle}
                                </TableCell>
                                <TableCell className="text-(--text-secondary) text-sm">
                                    {payout.hostName}
                                </TableCell>
                                <TableCell className="text-(--text-secondary) text-right">
                                    {formatNumberToINRWithDecimal(payout.grossAmount)}
                                </TableCell>
                                <TableCell className="text-(--status-error) font-medium text-right">
                                    − {formatNumberToINRWithDecimal(payout.commissionAmount)}
                                </TableCell>
                                <TableCell className="font-semibold text-(--status-success) text-right">
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

                                {/* Actions */}
                                <TableCell className="text-right pr-5">
                                    <div className="flex items-center justify-end gap-1">
                                        {/* View */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="View Details"
                                            className="text-(--text-secondary) hover:text-(--brand-primary) hover:bg-(--bg-accent)"
                                            onClick={() => setViewPayout(payout)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>

                                        {/* Approve — only pending */}
                                        {payout.status === "pending" && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Approve & Credit Wallet"
                                                className="text-(--text-secondary) hover:text-(--status-success) hover:bg-(--status-success-bg)"
                                                onClick={() => setApproveTarget(payout)}
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                            </Button>
                                        )}

                                        {/* Reject — only pending */}
                                        {payout.status === "pending" && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Reject Request"
                                                className="text-(--text-secondary) hover:text-(--status-error) hover:bg-(--badge-error-bg)"
                                                onClick={() => setRejectTarget(payout)}
                                            >
                                                <XCircle className="h-4 w-4" />
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
            {totalPayouts > 0 && (
                <AdminPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalPayouts}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* View Payout Detail Modal */}
            <Modal isOpen={!!viewPayout} onClose={() => setViewPayout(null)} title="Payout Request Details" size="md">
                {viewPayout && <PayoutDetailModal payout={viewPayout} onClose={() => setViewPayout(null)} />}
            </Modal>

            {/* Approve Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!approveTarget}
                onClose={() => setApproveTarget(null)}
                onConfirm={confirmApprove}
                title="Approve Payout Request"
                description={`Approve this request and credit ${formatNumberToINR(approveTarget?.netAmount ?? 0)} to ${approveTarget?.hostName}'s wallet for "${approveTarget?.eventTitle}"? This action cannot be undone.`}
                confirmText="Approve & Credit Wallet"
                cancelText="Cancel"
                variant="default"
                loading={isApproving}
            />

            {/* Payout Reject Modal */}
            <PayoutRejectModal
                isOpen={!!rejectTarget}
                payout={rejectTarget}
                onClose={() => setRejectTarget(null)}
                onConfirm={confirmReject}
                isRejecting={isRejecting}
            />
        </div>
    );
}
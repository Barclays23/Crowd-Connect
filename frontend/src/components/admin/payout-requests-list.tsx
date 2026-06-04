// frontend/src/components/admin/payout-requests-list.tsx

import { useState, useEffect, useCallback } from "react";
import {
   Search,
   Loader2,
   ArrowUpDown,
   ArrowUp,
   ArrowDown,
   BadgeCheck,
   Clock,
   Wallet,
   Ban,
   Eye,
   CheckCircle2,
   XCircle,
   TrendingUp,
   IndianRupee,
   Users,
   AlertTriangle,
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
import { formatDate1, formatDate2 } from "@/utils/dateAndTimeFormats";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { payoutServices } from "@/services/payoutServices";
import type {
   IPayoutRequest,
   PayoutSortField,
   PayoutSortDirection,
   PayoutRequestStatus,
} from "@/types/payout.types";
import { AdminPagination } from "@/components/admin/admin-pagination";

// ── Helpers ───────────────────────────────────────────────────────────────────

const PAYOUT_STATUS_BADGE: Record<PayoutRequestStatus, "default" | "secondary" | "success" | "destructive" | "outline"> = {
   pending  : "secondary",
   approved : "success",
   paid     : "success",
   rejected : "destructive",
};

const PAYOUT_STATUS_ICON: Record<PayoutRequestStatus, React.ReactNode> = {
   pending  : <Clock       className="h-3 w-3" />,
   approved : <BadgeCheck  className="h-3 w-3" />,
   paid     : <Wallet      className="h-3 w-3" />,
   rejected : <Ban         className="h-3 w-3" />,
};

function formatINR(amount: number) {
   return `₹${amount.toLocaleString("en-IN")}`;
}

function StatCard({ icon, label, value, sub }: {
   icon: React.ReactNode; label: string; value: string; sub?: string;
}) {
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


// ═══════════════════════════════════════════════════════════════════════════════
// Payout Detail Modal
// ═══════════════════════════════════════════════════════════════════════════════

function PayoutDetailModal({ payout, onClose }: { payout: IPayoutRequest; onClose: () => void }) {
   return (
      <div className="space-y-5 text-(--text-primary)">

         {/* Header status banner */}
         <div className={[
            "rounded-xl p-4 flex items-center justify-between",
            payout.status === "pending"  ? "bg-(--badge-warning-bg)  border border-(--border-warning)"  : "",
            payout.status === "paid"     ? "bg-(--badge-success-bg)  border border-(--border-success)"  : "",
            payout.status === "approved" ? "bg-(--badge-success-bg)  border border-(--border-success)"  : "",
            payout.status === "rejected" ? "bg-(--badge-danger-bg)   border border-(--border-brand)"    : "",
         ].join(" ")}>
            <div>
               <p className="text-xs font-bold uppercase tracking-widest text-(--text-tertiary)">Status</p>
               <Badge variant={PAYOUT_STATUS_BADGE[payout.status]} className="gap-1 capitalize mt-1">
                  {PAYOUT_STATUS_ICON[payout.status]} {payout.status}
               </Badge>
            </div>
            <div className="text-right">
               <p className="text-xs font-bold uppercase tracking-widest text-(--text-tertiary)">Net Payout</p>
               <p className="text-2xl font-extrabold text-(--status-success) mt-0.5">{formatINR(payout.netAmount)}</p>
            </div>
         </div>

         {/* Financial breakdown */}
         <div className="rounded-xl p-4 space-y-3 bg-(--bg-secondary) border border-(--card-border)">
            <p className="text-xs font-bold uppercase tracking-widest text-(--text-tertiary)">Financial Breakdown</p>
            <div className="space-y-2 text-sm">
               <DetailRow label="Event"              value={payout.eventTitle} />
               <DetailRow label="Host"               value={payout.hostName} />
               <DetailRow label="Tickets Sold"       value={`${payout.ticketsSold}`} />
               {/* Calculate the attendance percentage */}
                {payout.ticketsSold > 0 && (
                    <DetailRow 
                        label="QR Attendance Rate" 
                        value={`${payout.checkedInCount} checked in (${Math.round((payout.checkedInCount / payout.ticketsSold) * 100)}%)`} 
                        // Highlight in red if attendance is suspiciously low (e.g., less than 20%)
                        className={ (payout.checkedInCount / payout.ticketsSold) < 0.20 ? "text-destructive font-bold" : "text-(--status-success)" }
                    />
                )}
               <DetailRow label="Gross Revenue"      value={formatINR(payout.grossAmount)} />
               <DetailRow
                  label={`Platform Commission (${(payout.commissionRate * 100).toFixed(0)}%)`}
                  value={`− ${formatINR(payout.commissionAmount)}`}
                  className="text-destructive"
               />
               <div className="border-t border-(--border-muted) pt-2">
                  <DetailRow
                     label="Net Amount to Credit"
                     value={formatINR(payout.netAmount)}
                     className="text-(--status-success) font-extrabold text-base"
                  />
               </div>
            </div>
         </div>

         {/* Timeline */}
        <div className="rounded-xl p-4 space-y-2.5 bg-(--bg-secondary) border border-(--card-border)">
        <p className="text-xs font-bold uppercase tracking-widest text-(--text-tertiary) mb-3">Timeline</p>
        <DetailRow label="Payout ID"    value={payout.payoutId.slice(0, 20) + "…"} mono />
        <DetailRow label="Requested At" value={formatDate1(payout.requestedAt) || "—"} />
        
        {payout.reviewedBy && (
            <DetailRow label="Reviewed By" value={payout.reviewedBy} />
        )}
        
        {payout.reviewedAt && (
            <DetailRow 
                label={payout.status === "paid" ? "Paid At" : "Reviewed At"} 
                value={formatDate1(payout.reviewedAt)} 
            />
        )}
        </div>

         {/* Rejection reason */}
         {payout.status === "rejected" && payout.rejectionReason && (
            <div className="flex items-start gap-3 rounded-xl p-4 bg-(--badge-danger-bg) border border-(--border-brand)">
               <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
               <div>
                  <p className="text-sm font-semibold mb-1 text-(--badge-danger-text)">Rejection Reason</p>
                  <p className="text-sm text-(--badge-danger-text) opacity-85">{payout.rejectionReason}</p>
               </div>
            </div>
         )}

         <div className="flex justify-end pt-1">
            <Button variant="outline" onClick={onClose}>Close</Button>
         </div>
      </div>
   );
}

function DetailRow({ label, value, className = "", mono = false }: {
   label: string; value: string; className?: string; mono?: boolean;
}) {
   return (
      <div className="flex items-start justify-between gap-4 text-sm">
         <span className="text-(--text-secondary) shrink-0">{label}</span>
         <span className={`text-right font-medium text-(--text-primary) ${mono ? "font-mono text-xs" : ""} ${className}`}>
            {value}
         </span>
      </div>
   );
}


// ═══════════════════════════════════════════════════════════════════════════════
// Reject Modal
// ═══════════════════════════════════════════════════════════════════════════════

interface RejectModalProps {
   isOpen      : boolean;
   payout      : IPayoutRequest | null;
   onClose     : () => void;
   onConfirm   : (reason: string) => void;
   isRejecting : boolean;
}

function RejectModal({ isOpen, payout, onClose, onConfirm, isRejecting }: RejectModalProps) {
   const [reason, setReason] = useState("");

   useEffect(() => {
      if (isOpen) setReason("");
   }, [isOpen]);

   return (
      <Modal isOpen={isOpen} onClose={onClose} title="Reject Payout Request" size="md">
         <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
               You are rejecting the payout request of{" "}
               <span className="font-semibold text-(--text-primary)">{formatINR(payout?.netAmount ?? 0)}</span>{" "}
               for <span className="font-semibold text-(--text-primary)">"{payout?.eventTitle}"</span>.
               The host will be notified with your reason.
            </p>

            <div className="space-y-2">
               <label className="text-sm font-semibold">
                  Reason <span className="text-destructive">*</span>
               </label>
               <textarea
                  className="w-full min-h-24 p-3 rounded-md border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Provide a clear reason so the host can understand and resubmit if needed…"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isRejecting}
               />
            </div>

            <div className="flex justify-end gap-2 pt-2">
               <Button variant="outline" onClick={onClose} disabled={isRejecting}>Cancel</Button>
               <Button
                  variant="destructive"
                  onClick={() => onConfirm(reason)}
                  disabled={isRejecting || !reason.trim()}
               >
                  {isRejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Rejection
               </Button>
            </div>
         </div>
      </Modal>
   );
}


// ═══════════════════════════════════════════════════════════════════════════════
// Main Admin Component
// ═══════════════════════════════════════════════════════════════════════════════

export function PayoutRequestsList() {
    const [payouts, setPayouts]           = useState<IPayoutRequest[]>([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState<string | null>(null);

    const [searchTerm, setSearchTerm]     = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("pending"); // Default to pending for admin triage
    const [sortBy, setSortBy]             = useState<PayoutSortField>("requestedAt");
    const [sortOrder, setSortOrder]       = useState<PayoutSortDirection>("desc");

    const [currentPage, setCurrentPage]   = useState(1);
    const [totalPayouts, setTotalPayouts] = useState(0);
    const [totalPages, setTotalPages]     = useState(1);
    const itemsPerPage = 10;

    const [viewPayout, setViewPayout]     = useState<IPayoutRequest | null>(null);

    const [approveTarget, setApproveTarget] = useState<IPayoutRequest | null>(null);
    const [isApproving, setIsApproving]     = useState(false);

    const [rejectTarget, setRejectTarget]   = useState<IPayoutRequest | null>(null);
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
            const params = new URLSearchParams({
                page     : currentPage.toString(),
                limit    : itemsPerPage.toString(),
                sortBy,
                sortOrder,
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(statusFilter !== "all" && { status: statusFilter }),
            });
            const res = await payoutServices.getAllPayouts(params.toString());
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
    }, [currentPage, debouncedSearch, statusFilter, sortBy, sortOrder]);

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

    // ── Approve ──────────────────────────────────────────────────────────────────
    const confirmApprove = async () => {
        if (!approveTarget) return;
        setIsApproving(true);
        try {
            const res = await payoutServices.reviewPayout(approveTarget.payoutId, { action: "approve" });
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
            const res = await payoutServices.reviewPayout(rejectTarget.payoutId, { action: "reject", rejectionReason: reason });
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

    // ── Derived stats ─────────────────────────────────────────────────────────────
    const pendingTotal  = payouts.filter((p) => p.status === "pending").reduce((s, p) => s + p.netAmount, 0);
    const approvedTotal = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.netAmount, 0);

    return (
        <div className="space-y-6">

            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard icon={<Clock       className="h-3.5 w-3.5" />} label="Pending Value"   value={formatINR(pendingTotal)}  sub="awaiting review" />
                <StatCard icon={<Wallet      className="h-3.5 w-3.5" />} label="Total Paid Out"  value={formatINR(approvedTotal)} sub="credited to hosts" />
                <StatCard icon={<TrendingUp  className="h-3.5 w-3.5" />} label="Total Requests"  value={totalPayouts.toString()}  sub="all time" />
                <StatCard icon={<IndianRupee className="h-3.5 w-3.5" />} label="Commission Earned"
                value={formatINR(payouts.filter(p => p.status === "paid").reduce((s, p) => s + p.commissionAmount, 0))}
                sub="10% platform fee"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by event or host name…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                />
                </div>
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
                    <LoadingSpinner1 size="lg" message="Loading payout requests…" />
                </div>
                )}

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10">#</TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead>
                                <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" /> Host
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("grossAmount")}>
                                Gross <SortIcon field="grossAmount" />
                            </TableHead>
                            <TableHead>Commission</TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("netAmount")}>
                                Net Payout <SortIcon field="netAmount" />
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                                Status <SortIcon field="status" />
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("requestedAt")}>
                                Requested <SortIcon field="requestedAt" />
                            </TableHead>
                            <TableHead className="text-right pr-5">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-48 text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-48 text-center text-destructive">{error}</TableCell>
                            </TableRow>
                        ) : payouts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-48 text-center">
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Wallet className="h-10 w-10 opacity-30" />
                                    <p>No payout requests found</p>
                                </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            payouts.map((payout, idx) => (
                                <TableRow key={payout.payoutId}>
                                <TableCell className="font-medium">
                                    {(currentPage - 1) * itemsPerPage + idx + 1}
                                </TableCell>
                                <TableCell className="font-medium max-w-40 truncate" title={payout.eventTitle}>
                                    {payout.eventTitle}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {payout.hostName}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatINR(payout.grossAmount)}
                                </TableCell>
                                <TableCell className="text-destructive text-sm">
                                    − {formatINR(payout.commissionAmount)}
                                </TableCell>
                                <TableCell className="font-semibold text-(--status-success)">
                                    {formatINR(payout.netAmount)}
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

                                {/* Actions */}
                                <TableCell className="text-right pr-5">
                                    <div className="flex items-center justify-end gap-1">
                                        {/* View */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="View Details"
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
                                            onClick={() => setApproveTarget(payout)}
                                            >
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            </Button>
                                        )}

                                        {/* Reject — only pending */}
                                        {payout.status === "pending" && (
                                            <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Reject Request"
                                            onClick={() => setRejectTarget(payout)}
                                            >
                                            <XCircle className="h-4 w-4 text-destructive" />
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
                description={`Approve this request and credit ${formatINR(approveTarget?.netAmount ?? 0)} to ${approveTarget?.hostName}'s wallet for "${approveTarget?.eventTitle}"? This action cannot be undone.`}
                confirmText="Approve & Credit Wallet"
                cancelText="Cancel"
                variant="default"
                loading={isApproving}
            />

            {/* Reject Modal */}
            <RejectModal
                isOpen={!!rejectTarget}
                payout={rejectTarget}
                onClose={() => setRejectTarget(null)}
                onConfirm={confirmReject}
                isRejecting={isRejecting}
            />
        </div>
    );
}
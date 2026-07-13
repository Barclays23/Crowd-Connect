// frontend/src/components/admin/payout/payout-detail-modal.tsx

import { Eye, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate1 } from "@/utils/dateAndTimeFormats";
import { formatNumberToINR } from "@/utils/UI.utils";
import type { IPayoutState } from "@/types/payout.types";
import { PAYOUT_STATUS_BADGE, PAYOUT_STATUS_ICON } from "@/components/ui-constants/payout-constants";


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

export function PayoutDetailModal({ payout, onClose }: { payout: IPayoutState; onClose: () => void }) {
    return (
        <div className="space-y-5 text-(--text-primary)">
            {/* Header status banner */}
            <div className={[
                "rounded-xl p-4 flex items-center justify-between",
                payout.status === "pending"  ? "bg-(--badge-warning-bg)  border border-(--badge-warning-border)"  : "",
                payout.status === "paid"     ? "bg-(--badge-success-bg)  border border-(--badge-success-border)"  : "",
                payout.status === "approved" ? "bg-(--badge-success-bg)  border border-(--badge-success-border)"  : "",
                payout.status === "rejected" ? "bg-(--badge-error-bg)    border border-(--badge-error-border)"    : "",
            ].join(" ")}>
                <div>
                <p className="text-xs font-bold uppercase tracking-widest text-(--text-tertiary)">Status</p>
                <Badge variant={PAYOUT_STATUS_BADGE[payout.status]} className="gap-1 capitalize mt-1">
                    {PAYOUT_STATUS_ICON[payout.status]} {payout.status}
                </Badge>
                </div>
                <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-(--text-tertiary)">Net Payout</p>
                <p className="text-2xl font-extrabold text-(--status-success) mt-0.5">{formatNumberToINR(payout.netAmount)}</p>
                </div>
            </div>

            {/* Financial breakdown */}
            <div className="rounded-xl p-4 space-y-3 bg-(--bg-secondary) border border-(--card-border)">
                <p className="text-xs font-bold uppercase tracking-widest text-(--text-tertiary)">Financial Breakdown</p>
                <div className="space-y-2 text-sm">
                    <DetailRow label="Event"              value={payout.eventTitle} />
                    <DetailRow label="Host"               value={payout.hostName} />
                    
                    {/* Clear Split of Attendance Metrics */}
                    <DetailRow label="Tickets Sold"       value={`${payout.ticketsSold}`} />
                    <DetailRow label="Checked In"         value={`${payout.checkedInCount}`} />

                    {payout.ticketsSold > 0 && (
                        <DetailRow 
                            label="Attendance Rate" 
                            value={`${Math.round((payout.checkedInCount / payout.ticketsSold) * 100)}%`} 
                            className={ (payout.checkedInCount / payout.ticketsSold) < 0.30 ? "text-(--status-error) font-bold" : "text-(--status-success)" }
                        />
                    )}

                    <DetailRow label="Gross Revenue"      value={formatNumberToINR(payout.grossAmount)} />
                    <DetailRow
                        label={`Platform Commission (${(payout.commissionRate * 100).toFixed(0)}%)`}
                        value={`− ${formatNumberToINR(payout.commissionAmount)}`}
                        className="text-(--status-error)"
                    />
                    <div className="border-t border-(--border-muted) pt-2">
                        <DetailRow
                            label="Net Amount to Credit"
                            value={formatNumberToINR(payout.netAmount)}
                            className="text-(--status-success) font-extrabold text-base"
                        />
                    </div>
                </div>
            </div>

            {/* Proof Images */}
            {payout.proofUrls && payout.proofUrls.length > 0 && (
                <div className="rounded-xl p-4 space-y-3 bg-(--bg-secondary) border border-(--card-border)">
                    <p className="text-xs font-bold uppercase tracking-widest text-(--text-tertiary)">
                        Proof Images
                    </p>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {payout.proofUrls.map((url, i) => (
                            <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-md border border-(--border-muted) overflow-hidden group block"
                                title="Click to view full size"
                            >
                                <img 
                                   src={url} 
                                   alt={`proof-${i}`} 
                                   className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                                />
                                {/* Hover Overlay using CSS Vars */}
                                <div className="absolute inset-0 bg-transparent group-hover:bg-(--image-overlay) transition-colors flex items-center justify-center">
                                   <Eye className="text-(--overlay-text) opacity-0 group-hover:opacity-100 w-6 h-6 drop-shadow-md" />
                                </div>
                            </a>
                        ))}
                    </div>
                    <p className="text-[10px] text-(--text-tertiary) mt-1">
                        Click an image to view full size in a new tab.
                    </p>
                </div>
            )}

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
                <div className="flex items-start gap-3 rounded-xl p-4 bg-(--badge-error-bg) border border-(--badge-error-border)">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-(--status-error)" />
                    <div>
                        <p className="text-sm font-semibold mb-1 text-(--badge-error-text)">Rejection Reason</p>
                        <p className="text-sm text-(--badge-error-text) opacity-90">{payout.rejectionReason}</p>
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-1">
                <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
        </div>
    );
}
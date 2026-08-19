// frontend/src/components/checkin/ScanSuccessCard.tsx

import { Button } from "@/components/ui/button";
import type { CheckInResult } from "@/types/checkin.types";
import { CheckCircle2, ScanLine } from "lucide-react";



function Row({
    label, value, mono = false, highlight = false,
}: {
    label: string; value: string; mono?: boolean; highlight?: boolean;
}) {
    return (
        <div className="flex justify-between gap-4">
            <span className="text-(--text-tertiary)">{label}</span>
            <span className={[
                "text-right",
                mono      ? "font-mono text-xs"         : "",
                highlight ? "font-bold text-(--status-success)" : "text-(--text-primary)",
            ].join(" ")}>
                {value}
            </span>
        </div>
    );
}


export function ScanSuccessCard({result, onScanAgain }: {
    result: CheckInResult;
    onScanAgain: () => void;
}) {
    return (
        <div className="rounded-xl border border-(--badge-success-border) bg-(--badge-success-bg) p-5 space-y-3">
            <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-(--status-success)" />
                <p className="font-bold text-(--status-success)">
                {result.isFullyUsed ? "Entry Complete — All tickets used" : "Entry Granted"}
                </p>
            </div>

            <div className="rounded-lg bg-(--bg-secondary) p-4 space-y-2 text-sm border border-(--card-border)">
                <Row label="Name"    value={result.attendeeName} />
                <Row label="Email"   value={result.attendeeEmail} />
                <Row label="Ticket"  value={result.ticketNo} mono />
                <div className="border-t border-(--border-muted) my-1" />
                <Row label="Entered now"   value={`${result.entriesThisScan} person${result.entriesThisScan !== 1 ? "s" : ""}`} highlight />
                <Row
                    label="Remaining"
                    value={result.isFullyUsed ? "None (QR exhausted)" : `${result.remainingEntries} of ${result.quantity}`}
                />
            </div>

            <Button size="sm" variant="outline" onClick={onScanAgain} className="gap-2 w-full">
                <ScanLine size={13} />
                Scan Next Ticket
            </Button>
        </div>
    );
}
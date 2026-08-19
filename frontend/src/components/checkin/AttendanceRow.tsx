// frontend/src/components/checkin/AttendanceRow.tsx

import type { AttendanceRecord } from "@/types/checkin.types";
import { formatDate3 } from "@/utils/dateAndTime.utils";
import { CheckCircle2, Ticket } from "lucide-react";




export function AttendanceRow({ record }: { record: AttendanceRecord }) {
    const isFullyUsed = record.remainingEntries === 0;

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-(--bg-secondary) border border-(--card-border)">
            <div className={[
                "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                isFullyUsed ? "bg-(--badge-success-bg)" : "bg-(--badge-primary-bg)",
            ].join(" ")}>
                {isFullyUsed
                ? <CheckCircle2 size={17} className="text-(--status-success)" />
                : <Ticket size={17} className="text-(--brand-primary)" />
                }
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-(--text-primary) truncate">{record.attendeeName}</p>
                <p className="text-xs text-(--text-tertiary) truncate">{record.ticketNo}</p>
            </div>
            <div className="text-right shrink-0">
                <p className="text-sm font-bold text-(--text-primary)">
                    {record.entriesUsed}/{record.quantity}
                </p>
                <p className="text-[10px] text-(--text-tertiary)">
                    {formatDate3(record.checkedInAt)}
                </p>
            </div>
        </div>
    );
}
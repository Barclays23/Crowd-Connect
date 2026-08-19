// frontend/src/components/checkin/AttendanceTab.tsx

import { AttendanceRow } from "@/components/checkin/AttendanceRow";
import { LoadingSpinner1 } from "@/components/shared/LoadingSpinner1";
import { Button } from "@/components/ui/button";
import type { GetAttendanceResult } from "@/types/checkin.types";
import { RefreshCw, Users } from "lucide-react";




export function AttendanceTab({ attendance, loading, onRefresh }: {
  attendance: GetAttendanceResult | null;
  loading: boolean;
  onRefresh: () => void;
}) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <LoadingSpinner1 message="Loading attendance..." size="md" />
            </div>
        );
    }

    if (!attendance || attendance?.attendanceRecords?.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-(--text-tertiary)">
                <Users size={36} className="opacity-30" />
                <p className="text-sm">No one has checked in yet.</p>
                <Button size="sm" variant="outline" onClick={onRefresh} className="gap-2">
                <RefreshCw size={13} />
                    Refresh
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-(--text-secondary)">
                    {attendance?.attendanceRecords?.length} booking{attendance?.attendanceRecords?.length !== 1 ? "s" : ""} scanned
                    &nbsp;·&nbsp;
                    <span className="text-(--status-success)">{attendance.totalChecked} people entered</span>
                </p>
                <Button size="sm" variant="ghost" onClick={onRefresh} className="gap-1.5 text-xs">
                    <RefreshCw size={12} />
                    Refresh
                </Button>
            </div>

            <div className="space-y-2">
                {attendance?.attendanceRecords?.map((r) => (
                    <AttendanceRow key={r.bookingId} record={r} />
                ))}
            </div>
        </div>
    );
}
// frontend/src/pages/event/EventCheckIn.tsx

import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import {
  ScanLine, CheckCircle2, XCircle, Users,
  RefreshCw, ChevronUp, ChevronDown, Camera,
  CameraOff, Ticket, Clock,
} from "lucide-react";
import { Button }  from "@/components/ui/button";
import { Badge }   from "@/components/ui/badge";
import { LoadingSpinner1 } from "@/components/common/LoadingSpinner1";
import { toast }   from "react-toastify";
import { checkinServices } from "@/services/checkinServices";
import { formatDate3 }     from "@/utils/dateAndTimeFormats";
import type { IEventState } from "@/types/event.types";
import type { 
    AttendanceRecord, 
    CheckInResult, 
    CheckInScanState, 
    GetAttendanceResult, 
    ScanQRCodePayload
} from "@/types/checkin.types";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import type { ApiResponse } from "@/types/common.types";




// ─── Constants ────────────────────────────────────────────────────────────────
const SCANNER_DIV_ID = "cc-qr-scanner";
const AUTO_RESET_DELAY_MS = 4000; // auto-resume scanning after result

// ─── Props ────────────────────────────────────────────────────────────────────
interface EventCheckInProps {
  event: IEventState;
}

type ActiveTab = "scanner" | "attendance";




// ─── Component ────────────────────────────────────────────────────────────────
export function EventCheckIn({ event }: EventCheckInProps) {
    const [activeTab, setActiveTab]         = useState<ActiveTab>("scanner");
    const [scanState, setScanState]         = useState<CheckInScanState>({ status: "idle" });
    const [entryCount, setEntryCount]       = useState(1);
    const [pendingToken, setPendingToken]   = useState<string>("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [pendingMax, setPendingMax]       = useState(1);

    const [attendance, setAttendance]       = useState<GetAttendanceResult | null>(null);
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    const html5QrRef  = useRef<Html5Qrcode | null>(null);
    const resetTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isScanning  = useRef(false); // guard against concurrent scans

    // ── Fetch attendance ───────────────────────────────────────────────────────
    const fetchAttendance = useCallback(async () => {
        setAttendanceLoading(true);
        
        try {
            const response: ApiResponse<GetAttendanceResult> = await checkinServices.getAttendance(event.eventId);
            setAttendance(response.data);

        } catch(error: unknown) {
            const errorMessage = getApiErrorMessage(error)
            if (errorMessage) toast.error(errorMessage)
        } finally {
            setAttendanceLoading(false);
        }
    }, [event.eventId]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    // ── QR scanner lifecycle ───────────────────────────────────────────────────
    const stopScanner = useCallback(async () => {
        if (html5QrRef.current) {
            try {
                if (html5QrRef.current.isScanning) {
                    await html5QrRef.current.stop();
                }
                html5QrRef.current.clear();
            } catch {
                /* ignore */ 
            }
            html5QrRef.current = null;
        }
        isScanning.current = false;
    }, []);

    const startScanner = useCallback(async () => {
        if (isScanning.current) return;
        isScanning.current = true;

        try {
            const cameras = await Html5Qrcode.getCameras();
            if (!cameras.length) {
                toast.error("No camera found on this device.");
                isScanning.current = false;
                return;
            }

            // Prefer the back/environment camera (for mobile use at the door)
            const preferredCamera = cameras.find((c) => /back|environment|rear/i.test(c.label)) ?? cameras[0];

            const scanner = new Html5Qrcode(SCANNER_DIV_ID, {
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                verbose: false,
            });
            html5QrRef.current = scanner;

            await scanner.start(
                preferredCamera.id,
                { fps: 10, qrbox: { width: 240, height: 240 } },
                onScanSuccess,
                () => {} // ignore decode errors (not every frame has a QR)
            );

            setScanState({ status: "scanning" });

        } catch (error: unknown) {
            isScanning.current = false;
            const msg = error instanceof Error ? error.message : "Camera access denied.";
            const errorMessage  = getApiErrorMessage(error);
            if (errorMessage) toast.error(errorMessage)
            toast.error(msg);
            setScanState({ status: "idle" });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopScanner();
            if (resetTimer.current) clearTimeout(resetTimer.current);
        };
    }, [stopScanner]);

    // ── Scan success handler ───────────────────────────────────────────────────
    const onScanSuccess = useCallback(async (decodedText: string) => {
        // Pause scanner while we wait for user to confirm entry count
        await stopScanner();
        setScanState({ status: "confirming", rawToken: decodedText });
        setPendingToken(decodedText);

        // Try to read remaining entries from token to pre-fill count
        // (We don't expose it from JWT; we'll default to 1 and let the host adjust)
        setEntryCount(1);
        setPendingMax(99); // will be validated server-side
    }, [stopScanner]);

    // ── Confirm entry ──────────────────────────────────────────────────────────
    const confirmEntry = async () => {
        if (!pendingToken) return;
        setScanState({ status: "loading" });

        const payload: ScanQRCodePayload = {
            eventId:    event.eventId,
            qrToken:    pendingToken,
            entryCount: entryCount
        }

        try {
            const response: ApiResponse<CheckInResult> = await checkinServices.scanQRCode(payload);
            setScanState({ status: "success", result: response.data });
            fetchAttendance();

            // Auto-resume scanning after delay
            resetTimer.current = setTimeout(() => {
                setScanState({ status: "idle" });
                setPendingToken("");
            }, AUTO_RESET_DELAY_MS);

        } catch (error: unknown) {
            console.log('confirmEntry error :', error)
            const errorMessage  = getApiErrorMessage(error);
            // Safely cast error to access axios response properties
            const axiosError    = error as { response?: { data?: { errorCode?: string } } };
            const codeCode      = axiosError?.response?.data?.errorCode ?? "UNKNOWN";
            
            if (errorMessage) toast.error(errorMessage)
            setScanState({ status: "error", code: codeCode, message: errorMessage });

            resetTimer.current = setTimeout(() => {
                setScanState({ status: "idle" });
                setPendingToken("");
            }, AUTO_RESET_DELAY_MS);
        }
    };

    const handleScanAgain = async () => {
        if (resetTimer.current) clearTimeout(resetTimer.current);
        setPendingToken("");
        setScanState({ status: "idle" });
    };

    return (
        <div className="space-y-0 pb-2 text-(--text-primary)">

            {/* ── Event Header ───────────────────────────────────────────────── */}
            <div className="flex items-start justify-between mb-6 p-4 rounded-xl bg-(--bg-secondary) border border-(--card-border)">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-(--text-tertiary) mb-1">
                        Gate Check-In Station
                    </p>
                    <h3 className="text-lg font-bold text-(--heading-primary)">{event.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-(--text-tertiary)">
                        <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {formatDate3(event.startDateTime)}
                        </span>
                        <span>→</span>
                        <span>{formatDate3(event.endDateTime)}</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-(--text-tertiary) mb-0.5">Checked in</p>
                    <p className="text-2xl font-extrabold text-(--status-success)">
                        {attendance?.totalChecked ?? event.checkedInCount ?? 0}
                    </p>
                    <p className="text-xs text-(--text-tertiary)">/ {event.capacity} capacity</p>
                </div>
            </div>

            {/* ── Tab Bar ────────────────────────────────────────────────────── */}
            <div className="flex gap-1 p-1 rounded-xl bg-(--bg-secondary) border border-(--card-border) mb-5 w-fit">
                {(["scanner", "attendance"] as ActiveTab[]).map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={[
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer",
                    activeTab === tab
                        ? "bg-(--brand-primary) text-(--heading-primary) shadow-sm"
                        : "text-(--text-tertiary) hover:bg-(--bg-accent) hover:text-(--text-secondary)",
                    ].join(" ")}
                >
                    {tab === "scanner" ? <ScanLine size={14} /> : <Users size={14} />}
                    {tab === "scanner" ? "QR Scanner" : "Attendance"}
                    {tab === "attendance" && attendance && attendance?.attendanceRecords?.length > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-(--brand-primary-light) text-(--text-inverse)">
                        {attendance.totalChecked}
                    </span>
                    )}
                </button>
                ))}
            </div>

            {/* SCANNER TAB ══════════════════════════════════════════════════════════════════ */}
            {activeTab === "scanner" && (
                <div className="space-y-4">

                {/* ── Camera viewport ──────────────────────────────────────────── */}
                <div className="relative rounded-2xl overflow-hidden bg-(--bg-tertiary) border border-(--card-border)">
                    {/* html5-qrcode mounts here */}
                    <div
                        id={SCANNER_DIV_ID}
                        className="w-full"
                        style={{ minHeight: 280 }}
                    />

                        {/* Overlay when not scanning */}
                        {scanState.status === "idle" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-(--bg-tertiary)/90">
                                <Camera size={48} className="text-(--text-tertiary) opacity-40" />
                                <p className="text-sm text-(--text-tertiary)">Camera is off</p>
                                <Button onClick={startScanner} className="gap-2">
                                    <ScanLine size={15} />
                                    Start Scanner
                                </Button>
                            </div>
                        )}

                        {/* Scanning indicator */}
                        {scanState.status === "scanning" && (
                            <div className="absolute top-3 left-3">
                                <Badge className="gap-1.5 text-xs bg-(--badge-success-bg) text-(--badge-success-text) border-(--badge-success-border)">
                                <span className="h-1.5 w-1.5 rounded-full bg-(--status-success) animate-pulse inline-block" />
                                Live — Point at QR code
                                </Badge>
                            </div>
                        )}

                        {/* Stop button */}
                        {scanState.status === "scanning" && (
                            <div className="absolute bottom-3 right-3">
                                <Button size="sm" variant="outline" onClick={stopScanner} className="gap-1.5 text-xs">
                                    <CameraOff size={13} />
                                    Stop
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* ── Confirm Panel (QR detected) ───────────────────────────────── */}
                    {scanState.status === "confirming" && (
                        <div className="rounded-xl border border-(--card-border) bg-(--bg-secondary) p-5 space-y-4">
                            <div className="flex items-center gap-2">
                                <ScanLine size={18} className="text-(--brand-primary)" />
                                <p className="font-semibold text-(--heading-primary)">QR Code Detected</p>
                            </div>
                            <p className="text-sm text-(--text-secondary)">
                                How many people are entering with this ticket?
                            </p>

                            <div className="flex items-center gap-3">
                                <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setEntryCount((c) => Math.max(1, c - 1))}
                                disabled={entryCount <= 1}
                                >
                                <ChevronDown size={16} />
                                </Button>
                                <span className="text-3xl font-extrabold w-12 text-center text-(--heading-primary)">
                                {entryCount}
                                </span>
                                <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setEntryCount((c) => c + 1)}
                                >
                                <ChevronUp size={16} />
                                </Button>
                                <span className="text-sm text-(--text-tertiary) ml-1">
                                person{entryCount !== 1 ? "s" : ""} entering
                                </span>
                            </div>

                            <div className="flex gap-2 pt-1">
                                <Button onClick={confirmEntry} className="flex-1 gap-2">
                                <CheckCircle2 size={15} />
                                Grant Entry
                                </Button>
                                <Button variant="outline" onClick={handleScanAgain} className="gap-2">
                                <RefreshCw size={14} />
                                Rescan
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ── Loading ─────────────────────────────────────────────────── */}
                    {scanState.status === "loading" && (
                        <div className="rounded-xl border border-(--card-border) bg-(--bg-secondary) py-4 flex items-center justify-center">
                            <LoadingSpinner1 message="Validating ticket..." size="sm" />
                        </div>
                    )}

                    {/* ── Success ──────────────────────────────────────────────────── */}
                    {scanState.status === "success" && (
                        <ScanSuccessCard result={scanState.result} onScanAgain={handleScanAgain} />
                    )}

                    {/* ── Error ────────────────────────────────────────────────────── */}
                    {scanState.status === "error" && (
                        <ScanErrorCard
                            code={scanState.code}
                            message={scanState.message}
                            onScanAgain={handleScanAgain}
                        />
                    )}
                </div>
            )}

            {/* ATTENDANCE TAB ══════════════════════════════════════════════════════════════════ */}
            {activeTab === "attendance" && (
                <AttendanceTab
                    attendance={attendance}
                    loading={attendanceLoading}
                    onRefresh={fetchAttendance}
                />
            )}
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScanSuccessCard({
  result,
  onScanAgain,
}: {
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

function ScanErrorCard({
  code,
  message,
  onScanAgain,
}: {
  code: string;
  message: string;
  onScanAgain: () => void;
}) {
  return (
    <div className="rounded-xl border border-(--badge-error-border) bg-(--badge-error-bg) p-5 space-y-3">
      <div className="flex items-center gap-2">
        <XCircle size={20} className="text-(--status-error)" />
        <p className="font-bold text-(--status-error)">Entry Denied</p>
      </div>
      <p className="text-sm text-(--text-secondary)">{message}</p>
      <p className="text-xs text-(--text-tertiary) font-mono">{code}</p>
      <Button size="sm" variant="outline" onClick={onScanAgain} className="gap-2 w-full">
        <RefreshCw size={13} />
        Try Again
      </Button>
    </div>
  );
}

function AttendanceTab({
  attendance,
  loading,
  onRefresh,
}: {
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

function AttendanceRow({ record }: { record: AttendanceRecord }) {
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
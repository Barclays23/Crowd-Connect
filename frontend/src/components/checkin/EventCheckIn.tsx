// frontend/src/components/checkin/EventCheckIn.tsx

import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import {
  ScanLine, CheckCircle2, Users,
  RefreshCw, ChevronUp, ChevronDown, Camera,
  CameraOff, Clock,
  Timer,
  Lock,
} from "lucide-react";
import { Button }  from "@/components/ui/button";
import { Badge }   from "@/components/ui/badge";
import { LoadingSpinner1 } from "@/components/shared/LoadingSpinner1";
import { toast }   from "react-toastify";
import { checkinServices } from "@/services/checkinServices";
import { formatDate3 }     from "@/utils/dateAndTime.utils";
import type { IEventState } from "@/types/event.types";
import type {  
    CheckInResult, 
    CheckInScanState, 
    GetAttendanceResult, 
    ScanQRCodePayload
} from "@/types/checkin.types";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import type { ApiResponse } from "@/types/common.types";
import { ScanSuccessCard } from "@/components/checkin/ScanSuccessCard";
import { ScanErrorCard } from "@/components/checkin/ScanErrorCard";
import { AttendanceTab } from "@/components/checkin/AttendanceTab";
import { EARLY_CHECKIN_BUFFER_MS } from "@/constants/checkin.constants";
import { MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE, MS_PER_SECOND } from "@/constants/dateAndTime.constants";




interface ExtendedMediaTrackConstraintSet extends MediaTrackConstraintSet {
  focusMode?: "none" | "manual" | "single-shot" | "continuous";
}

interface ExtendedMediaTrackConstraints extends Omit<MediaTrackConstraints, "advanced"> {
  advanced?: ExtendedMediaTrackConstraintSet[];
}


const videoConstraints: ExtendedMediaTrackConstraints = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  advanced: [{ focusMode: "continuous" }],
};


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
    const [timeParts, setTimeParts] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(true);

    const [attendance, setAttendance]       = useState<GetAttendanceResult | null>(null);
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    const html5QrRef  = useRef<Html5Qrcode | null>(null);
    const resetTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isScanning  = useRef(false); // guard against concurrent scans


    // ── Live Timer Logic ──
    useEffect(() => {
        const startMs = new Date(event.startDateTime).getTime();
        const scanOpenTimeMs = startMs - EARLY_CHECKIN_BUFFER_MS;

        const updateTimer = () => {
            const nowMs = Date.now();
            const diff = scanOpenTimeMs - nowMs;
            
            if (diff > 0) {
                setTimeParts({
                    days: Math.floor(diff / MS_PER_DAY),
                    hours: Math.floor((diff % MS_PER_DAY) / MS_PER_HOUR),
                    minutes: Math.floor((diff % MS_PER_HOUR) / MS_PER_MINUTE),
                    seconds: Math.floor((diff % MS_PER_MINUTE) / MS_PER_SECOND),
                });
                setIsCheckInOpen(false);
            } else {
                setIsCheckInOpen(true);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        
        return () => clearInterval(interval);
    }, [event.startDateTime]);

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
                useBarCodeDetectorIfSupported: true,
                verbose: false,
            });
            html5QrRef.current = scanner;

            await scanner.start(
                preferredCamera.id,
                { 
                    // Increase FPS for faster frame processing
                    fps: 20, 
                    // Make the scanning area dynamic and larger (80% of the shortest dimension)
                    qrbox: (videoWidth, videoHeight) => {
                        const minEdge = Math.min(videoWidth, videoHeight);
                        const boxSize = Math.floor(minEdge * 0.8);
                        return { width: boxSize, height: boxSize };
                    },
                    // Disable flip for rear cameras to improve performance, 
                    // but keep it true if you primarily expect laptops/front cameras
                    disableFlip: false,
                    videoConstraints: videoConstraints
                },
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
                <div 
                    className={[
                        "relative rounded-2xl overflow-hidden bg-(--bg-secondary) border border-(--card-border) w-full transition-all duration-300",
                        // Dynamically adjust minimum height to fit the locked UI without clipping
                        scanState.status === "idle" && !isCheckInOpen ? "min-h-90" : "min-h-70",
                        scanState.status === "idle" || scanState.status === "scanning" ? "block" : "hidden"
                    ].join(" ")}
                >
                    {/* html5-qrcode mounts here */}
                    <div id={SCANNER_DIV_ID} className="w-full h-full" />

                    {/* Overlay when not scanning */}
                    {scanState.status === "idle" && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-(--bg-tertiary) p-4 md:p-6 text-center">
                            
                            {!isCheckInOpen ? (
                                /* ── Locked / Too Early State ── */
                                <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300 w-full max-w-sm">
                                    
                                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-(--badge-warning-bg) border-4 border-(--brand-primary-light)/50 flex items-center justify-center mb-2 md:mb-2 shadow-sm">
                                        <Timer className="w-8 h-8 md:w-10 md:h-10 text-(--brand-primary)" />
                                    </div>
                                    
                                    <h4 className="text-xl md:text-2xl font-bold text-(--heading-primary) mb-1.5">
                                        Check-in Not Started
                                    </h4>
                                    <p className="text-sm md:text-base text-(--text-secondary) mb-6 md:mb-8">
                                        Scanner will automatically unlock in:
                                    </p>
                                    
                                    {/* Segmented Countdown Clock */}
                                    <div className="flex items-center justify-center gap-3 md:gap-4 w-full mb-8 md:mb-10">
                                        {[
                                            { label: "Days", value: timeParts.days },
                                            { label: "Hours", value: timeParts.hours },
                                            { label: "Mins", value: timeParts.minutes },
                                            { label: "Secs", value: timeParts.seconds },
                                        ].map((part, idx) => (
                                            <div key={idx} className="flex flex-col items-center justify-center bg-(--bg-secondary) border border-(--card-border) rounded-xl w-16 h-16 md:w-20 md:h-20 shadow-sm">
                                                <span className="text-2xl md:text-3xl font-black text-(--brand-primary) leading-none mb-1">
                                                    {part.value.toString().padStart(2, '0')}
                                                </span>
                                                <span className="text-[10px] md:text-xs font-bold text-(--text-tertiary) uppercase tracking-wider">
                                                    {part.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <Button disabled variant="secondary" className="w-full gap-2 opacity-60">
                                        <Lock size={16} />
                                        Scanner Locked
                                    </Button>
                                </div>
                            ) : (
                                /* ── Normal Idle State ── */
                                <div className="flex flex-col items-center animate-in fade-in duration-200">
                                    <Camera size={48} className="text-(--text-tertiary) opacity-40 mb-4" />
                                    <p className="text-sm text-(--text-tertiary) mb-6">Camera is off</p>
                                    <Button onClick={startScanner} className="gap-2 shadow-sm">
                                        <ScanLine size={16} />
                                        Start Scanner
                                    </Button>
                                </div>
                            )}
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
                    <div className="rounded-2xl border border-(--card-border) bg-(--bg-secondary) p-8 shadow-sm text-center space-y-8 animate-in fade-in zoom-in-95 duration-200">
                        
                        {/* Header Section */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-(--brand-primary)/10 text-(--brand-primary) rounded-full">
                                <ScanLine size={32} />
                            </div>
                            <div>
                                <h4 className="text-2xl font-bold text-(--heading-primary)">QR Code Detected</h4>
                                <p className="text-sm text-(--text-secondary) mt-1">
                                    Confirm the number of attendees for this ticket.
                                </p>
                            </div>
                        </div>

                        {/* Interactive Counter Section */}
                        <div className="flex items-center justify-center gap-8 py-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-16 w-16 rounded-full border-2 border-(--card-border) hover:border-(--brand-primary) hover:text-(--brand-primary) transition-colors"
                                onClick={() => setEntryCount((c) => Math.max(1, c - 1))}
                                disabled={entryCount <= 1}
                            >
                                <ChevronDown size={28} />
                            </Button>
                            
                            <div className="flex flex-col items-center min-w-25">
                                <span className="text-7xl font-black text-(--heading-primary) leading-none tracking-tighter">
                                    {entryCount}
                                </span>
                                <span className="text-xs font-bold text-(--text-tertiary) uppercase tracking-widest mt-2">
                                    {entryCount === 1 ? "Person" : "People"}
                                </span>
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-16 w-16 rounded-full border-2 border-(--card-border) hover:border-(--brand-primary) hover:text-(--brand-primary) transition-colors"
                                onClick={() => setEntryCount((c) => c + 1)}
                            >
                                <ChevronUp size={28} />
                            </Button>
                        </div>

                        {/* Action Buttons (Strict 50:50 layout) */}
                        <div className="flex gap-4 pt-2 w-full max-w-md mx-auto">
                            <Button 
                                variant="secondary" 
                                onClick={handleScanAgain} 
                                className="flex-1 h-14 gap-2 text-base font-semibold"
                            >
                                <RefreshCw size={18} />
                                Rescan
                            </Button>
                            <Button 
                                onClick={confirmEntry} 
                                className="flex-1 h-14 gap-2 text-base font-semibold bg-(--status-success) hover:bg-(--status-success)/90 text-white"
                            >
                                <CheckCircle2 size={18} />
                                Grant Entry
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── Loading ─────────────────────────────────────────────────── */}
                {scanState.status === "loading" && (
                    <div className="rounded-2xl border border-(--card-border) bg-(--bg-secondary) py-12 flex flex-col items-center justify-center gap-4">
                        <LoadingSpinner1 message="Validating ticket..." size="lg" />
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
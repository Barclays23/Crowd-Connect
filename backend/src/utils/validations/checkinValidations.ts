// backend/src/utils/validations/checkinValidations.ts

import { MS_PER_MINUTE } from "@/constants/dateAndTime.constants";
import { EARLY_CHECKIN_BUFFER_MS } from "@/constants/event.constants";
import { HTTP_STATUS }             from "@/constants/http-status.constants";
import { BOOKING_MESSAGES } from "@/constants/messages.constants";
import { 
    CheckInBookingPopulated, 
    ENTERABLE_STATUSES, 
    SCANNABLE_EVENT_STATUSES 
} from "@/types/checkin.types";
import { formatTimeRemaining } from "@/utils/dateAndTime.utils";
import { createHttpError }        from "@/utils/httpError.utils";



// Validates raw controller input before any DB call.
// Catches: missing token, entryCount = 0, negative, NaN, non-integer.
export function validateScanQRInput(qrToken: string, entryCount: number): void {
    if (!qrToken || typeof qrToken !== "string" || qrToken.trim() === "") {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, "QR token is required.");
    }

    if (!Number.isInteger(entryCount) || entryCount < 1) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            "Entry count must be a whole number of at least 1."
        );
    }
}



// Verifies that the eventId embedded in the QR token matches the route's eventId.
// Prevents a valid ticket from a different event being accepted here.
export function validateQrEventMatch(tokenEventId: string, hostEventId: string): void {
    if (tokenEventId !== hostEventId) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            "This QR code belongs to a different event."
        );
    }
}



// Validates booking status and entry capacity for event checkin.
export function validateBookingForCheckIn(
    booking:    CheckInBookingPopulated | null,
    entryCount: number,
): asserts booking is CheckInBookingPopulated {
    if (!booking) {
        throw createHttpError(HTTP_STATUS.NOT_FOUND, BOOKING_MESSAGES.BOOKING_NOT_FOUND);
    }

    // ── 4. Booking status check ───────────────────────────────────────────────
    if (!ENTERABLE_STATUSES.includes(booking.bookingStatus)) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            `This booking is ${booking.bookingStatus}. Entry not permitted.`
        );
    }

    // ── 5. Remaining entries check ────────────────────────────────────────────
    if (booking.remainingEntries === 0) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            "All tickets for this booking have already been used."
        );
    }

    // ── 6. Entry count validation ─────────────────────────────────────────────
    if (entryCount > booking.remainingEntries) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            `Cannot admit ${entryCount}. Only ${booking.remainingEntries} ${booking.remainingEntries === 1 ? "entry" : "entries"} remaining.`
        );
    }
}



// Validates event status and live time window for event checkin.
// No JWT exp used — always reads event dates fresh from DB.
export function validateEventForCheckIn(
    eventRef: CheckInBookingPopulated["eventRef"],
): void {
    if (!SCANNABLE_EVENT_STATUSES.includes(eventRef.eventStatus)) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            `Event is ${eventRef.eventStatus}. Check-in is not available.`
        );
    }

    const nowMs             = Date.now();
    const startMs           = eventRef.startDateTime.getTime();
    const endMs             = eventRef.endDateTime.getTime();
    const scanOpenTimeMs    = startMs - EARLY_CHECKIN_BUFFER_MS;

    // 3. Check if scanner opens in the future
    if (nowMs < scanOpenTimeMs) {
        const timeDiffMs = scanOpenTimeMs - nowMs;
        const formattedRemainingTime = formatTimeRemaining(timeDiffMs);
        const bufferMinutes = Math.floor(EARLY_CHECKIN_BUFFER_MS / MS_PER_MINUTE);
        
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            `Check-in opens ${bufferMinutes} minutes before the event starts (opens in ${formattedRemainingTime}).`
        );
    }

    if (nowMs > endMs) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            "This event has already ended. QR code is expired."
        );
    }

}
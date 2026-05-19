// backend/src/utils/validations/checkinValidations.ts

import { HttpStatus }             from "@/constants/statusCodes.constants";
import { 
    CheckInBookingPopulated, 
    EARLY_CHECKIN_BUFFER_MS, 
    ENTERABLE_STATUSES, 
    SCANNABLE_EVENT_STATUSES 
} from "@/types/checkin.types";
import { createHttpError }        from "@/utils/httpError.utils";



// Validates raw controller input before any DB call.
// Catches: missing token, entryCount = 0, negative, NaN, non-integer.
export function validateScanQRInput(qrToken: string, entryCount: number): void {
    if (!qrToken || typeof qrToken !== "string" || qrToken.trim() === "") {
        throw createHttpError(HttpStatus.BAD_REQUEST, "QR token is required.");
    }

    if (!Number.isInteger(entryCount) || entryCount < 1) {
        throw createHttpError(
            HttpStatus.BAD_REQUEST,
            "Entry count must be a whole number of at least 1."
        );
    }
}



// Verifies that the eventId embedded in the QR token matches the route's eventId.
// Prevents a valid ticket from a different event being accepted here.
export function validateQrEventMatch(tokenEventId: string, hostEventId: string): void {
    if (tokenEventId !== hostEventId) {
        throw createHttpError(
            HttpStatus.BAD_REQUEST,
            "This QR code belongs to a different event."
        );
    }
}



// Validates booking status and entry capacity for event checkin.
export function validateBookingForCheckIn(
    booking:    CheckInBookingPopulated,
    entryCount: number,
): void {
    // ── 4. Booking status check ───────────────────────────────────────────────
    if (!ENTERABLE_STATUSES.includes(booking.bookingStatus)) {
        throw createHttpError(
            HttpStatus.BAD_REQUEST,
            `This booking is ${booking.bookingStatus}. Entry not permitted.`
        );
    }

    // ── 5. Remaining entries check ────────────────────────────────────────────
    if (booking.remainingEntries === 0) {
        throw createHttpError(
            HttpStatus.BAD_REQUEST,
            "All tickets for this booking have already been used."
        );
    }

    // ── 6. Entry count validation ─────────────────────────────────────────────
    if (entryCount > booking.remainingEntries) {
        throw createHttpError(
            HttpStatus.BAD_REQUEST,
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
            HttpStatus.BAD_REQUEST,
            `Event is ${eventRef.eventStatus}. Check-in is not available.`
        );
    }

    const now          = new Date();
    const scanOpenTime = new Date(eventRef.startDateTime.getTime() - EARLY_CHECKIN_BUFFER_MS);

    if (now < scanOpenTime) {
        const minutesUntilOpen = Math.ceil((eventRef.startDateTime.getTime() - now.getTime()) / 60_000);
        
        throw createHttpError(
            HttpStatus.BAD_REQUEST,
            `Check-in opens ${EARLY_CHECKIN_BUFFER_MS/60/1000} minutes before the event starts (opens in ${minutesUntilOpen} min).`
        );
    }

    if (now > eventRef.endDateTime) {
        throw createHttpError(
            HttpStatus.BAD_REQUEST,
            "This event has already ended. QR code is expired."
        );
    }
}
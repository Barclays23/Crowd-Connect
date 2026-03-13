// backend/src/utils/validations/bookingValidations.ts

import { BOOKING_MESSAGES } from "@/constants/booking.constants";
import { HttpStatus } from "@/constants/statusCodes.constants";
import { BookingEntityPopulated } from "@/entities/booking.entity";
import { BOOKING_STATUS } from "@/types/booking.types";
import { createHttpError } from "@/utils/httpError.utils";




export function validateBookingCancellation(
    booking: BookingEntityPopulated | null
): asserts booking is BookingEntityPopulated {        
    if (!booking) {
        throw createHttpError(HttpStatus.NOT_FOUND, BOOKING_MESSAGES.BOOKING_NOT_FOUND);
    }

    if (booking.bookingStatus === BOOKING_STATUS.CANCELLED) {
        throw createHttpError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.BOOKING_ALREADY_CANCELLED);
    }
    if (booking.bookingStatus === BOOKING_STATUS.FAILED || 
        booking.bookingStatus === BOOKING_STATUS.PENDING ||
        booking.bookingStatus === BOOKING_STATUS.ATTENDED
    ) {
        throw createHttpError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.CANCELLATION_NOT_ALLOWED);
    }
    if (booking.event.startDateTime <= new Date()) {
        throw createHttpError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.CANCELLATION_WINDOW_CLOSED);
    }

    // QR scanning opens 30 min before startDateTime — entries may already
    // be consumed before the event-started guard above triggers.
    if (booking.remainingEntries === 0 || booking.quantity !== booking.remainingEntries) {
        throw createHttpError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.CANNOT_CANCEL_AFTER_ENTRY);
    }
}



export function validateBookingCancelByUser(
    booking: BookingEntityPopulated | null,
    userId: string
): asserts booking is BookingEntityPopulated {
    validateBookingCancellation(booking);
    
    // the only additional validation is only booked user can cancel this booking         
    if (booking.user.userId !== userId) {
        throw createHttpError(HttpStatus.FORBIDDEN, BOOKING_MESSAGES.UNAUTHORIZED_BOOKING_CANCELLATION);
    }
}



export function validateBookingCancelByAuthority(
    booking: BookingEntityPopulated | null
): asserts booking is BookingEntityPopulated {
    validateBookingCancellation(booking);
}




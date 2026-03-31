// backend/src/utils/validations/bookingValidations.ts

import { 
    MIN_TICKETS_PER_BOOKING, 
    OFFLINE_MAX_TICKETS_PER_BOOKING, 
    OFFLINE_MAX_TICKETS_PER_USER, 
    ONLINE_MAX_TICKETS_PER_USER 
} from "@/constants/booking.constants";
import { BookingMessages, DynamicBookingMessages, EventMessages, UserMessages } from "@/constants/responseMessages.constants";
import { UserRole } from "@/constants/roles-and-statuses";
import { HttpStatus } from "@/constants/statusCodes.constants";
import { BookingOrderRequestDTO } from "@/dtos/booking.dto";
import { BookingEntity, BookingEntityPopulated } from "@/entities/booking.entity";
import { EventEntity } from "@/entities/event.entity";
import { UserEntity } from "@/entities/user.entity";
import { BOOKING_STATUS } from "@/types/booking.types";
import { EVENT_FORMAT, EVENT_STATUS } from "@/types/event.types";
import { createHttpError } from "@/utils/httpError.utils";




export function validateInitiateBooking(
    user: UserEntity | null,
    event: EventEntity | null,
    bookingReqDto: BookingOrderRequestDTO,
    existingTicketCount: number,
    ticketsLeft: number
): asserts event is EventEntity {
// ): { user: UserEntity; event: EventEntity } {
    if (!user) {
        throw createHttpError(HttpStatus.NOT_FOUND, UserMessages.USER_NOT_FOUND);
    }

    if (user.isSuperAdmin) {
        throw createHttpError(HttpStatus.FORBIDDEN, BookingMessages.SUPER_ADMIN_CANNOT_BOOK);
    }
    if (user.role === UserRole.ADMIN) {
        throw createHttpError(HttpStatus.FORBIDDEN, BookingMessages.ADMIN_CANNOT_BOOK);
    }

    if (!event) {
        throw createHttpError(HttpStatus.NOT_FOUND, EventMessages.EVENT_NOT_FOUND);
    }

    if (event.organizer.hostId.toString() === bookingReqDto.userId) {
        throw createHttpError(HttpStatus.BAD_REQUEST, BookingMessages.CANNOT_BOOK_OWN_EVENT);
    }

    if (event.eventStatus === EVENT_STATUS.CANCELLED) {
        throw createHttpError(HttpStatus.BAD_REQUEST, EventMessages.EVENT_ALREADY_CANCELLED);
    }
    if (event.eventStatus === EVENT_STATUS.SUSPENDED) {
        throw createHttpError(HttpStatus.BAD_REQUEST, EventMessages.EVENT_ALREADY_SUSPENDED);
    }
    if (event.eventStatus === EVENT_STATUS.COMPLETED || event.endDateTime < new Date()) {
        throw createHttpError(HttpStatus.BAD_REQUEST, EventMessages.EVENT_ALREADY_ENDED);
    }
    if (event.eventStatus === EVENT_STATUS.DRAFT) {
        throw createHttpError(HttpStatus.BAD_REQUEST, BookingMessages.EVENT_NOT_BOOKABLE);
    }

    if (ticketsLeft <= 0) {
        throw createHttpError(HttpStatus.BAD_REQUEST, BookingMessages.TICKETS_SOLD_OUT);
    }

    if (bookingReqDto.quantity > ticketsLeft) {
        throw createHttpError(HttpStatus.BAD_REQUEST, DynamicBookingMessages.NOT_ENOUGH_TICKETS(ticketsLeft));
    }

    // Format-specific validations
    if (event.format === EVENT_FORMAT.ONLINE) {
        if (bookingReqDto.quantity !== ONLINE_MAX_TICKETS_PER_USER) {
            throw createHttpError(HttpStatus.BAD_REQUEST, BookingMessages.ONLINE_LIMIT_PER_USER);
        }
        if (existingTicketCount >= ONLINE_MAX_TICKETS_PER_USER) {
            throw createHttpError(HttpStatus.CONFLICT, BookingMessages.ONLINE_LIMIT_EXCEEDED);
        }
    } else {
        if (bookingReqDto.quantity < MIN_TICKETS_PER_BOOKING) {
            throw createHttpError(HttpStatus.BAD_REQUEST, BookingMessages.MIN_TICKETS_REQUIRED);
        }
        if (bookingReqDto.quantity > OFFLINE_MAX_TICKETS_PER_BOOKING) {
            throw createHttpError(HttpStatus.BAD_REQUEST, BookingMessages.PER_BOOKING_LIMIT_EXCEEDED);
        }
        if (existingTicketCount + bookingReqDto.quantity > OFFLINE_MAX_TICKETS_PER_USER) {
            throw createHttpError(
                HttpStatus.BAD_REQUEST, 
                DynamicBookingMessages.PER_USER_LIMIT_EXCEEDED(existingTicketCount)
            );
        }
    }

    // return { user, event };
}



export function validateVerifyAndConfirmPayment(
    booking: BookingEntity | null,
    userId: string
): asserts booking is BookingEntity {
    if (!booking) {
        throw createHttpError(HttpStatus.NOT_FOUND, "Booking not found for this order");
    }
    if (booking.userRef !== userId) {
        throw createHttpError(HttpStatus.FORBIDDEN, "Unauthorized");
    }
    if (booking.bookingStatus !== BOOKING_STATUS.PENDING) {
        throw createHttpError(HttpStatus.BAD_REQUEST, "This booking has already been processed");
    }
}



export function validateBookingCancellation(
    booking: BookingEntityPopulated | null
): asserts booking is BookingEntityPopulated {        
    if (!booking) {
        throw createHttpError(HttpStatus.NOT_FOUND, BookingMessages.BOOKING_NOT_FOUND);
    }

    if (booking.bookingStatus === BOOKING_STATUS.CANCELLED) {
        throw createHttpError(HttpStatus.BAD_REQUEST, BookingMessages.BOOKING_ALREADY_CANCELLED);
    }
    if (booking.bookingStatus === BOOKING_STATUS.FAILED || 
        booking.bookingStatus === BOOKING_STATUS.PENDING ||
        booking.bookingStatus === BOOKING_STATUS.ATTENDED
    ) {
        throw createHttpError(HttpStatus.BAD_REQUEST, BookingMessages.CANCELLATION_NOT_ALLOWED);
    }
    if (booking.event.startDateTime <= new Date()) {
        throw createHttpError(HttpStatus.BAD_REQUEST, BookingMessages.CANCELLATION_WINDOW_CLOSED);
    }

    // QR scanning opens 30 min before startDateTime — entries may already
    // be consumed before the event-started guard above triggers.
    if (booking.remainingEntries === 0 || booking.quantity !== booking.remainingEntries) {
        throw createHttpError(HttpStatus.BAD_REQUEST, BookingMessages.CANNOT_CANCEL_AFTER_ENTRY);
    }
}



export function validateBookingCancelByUser(
    booking: BookingEntityPopulated | null,
    userId: string
): asserts booking is BookingEntityPopulated {
    validateBookingCancellation(booking);
    
    // the only additional validation is only booked user can cancel this booking         
    if (booking.user.userId !== userId) {
        throw createHttpError(HttpStatus.FORBIDDEN, BookingMessages.UNAUTHORIZED_BOOKING_CANCELLATION);
    }
}



export function validateBookingCancelByAuthority(
    booking: BookingEntityPopulated | null
): asserts booking is BookingEntityPopulated {
    validateBookingCancellation(booking);
}




// backend/src/utils/validations/bookingValidations.ts
import { 
    BOOKING_STATUSES,
    MIN_TICKETS_PER_BOOKING, 
    OFFLINE_MAX_TICKETS_PER_BOOKING, 
    OFFLINE_MAX_TICKETS_PER_USER, 
    ONLINE_MAX_TICKETS_PER_USER 
} from "@/constants/booking.constants";
import { 
    BOOKING_MESSAGES, 
    DYNAMIC_BOOKING_MESSAGES, 
    EVENT_MESSAGES, 
    USER_MESSAGES 
} from "@/constants/messages.constants";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { BookingOrderRequestDTO } from "@/dtos/booking.dto";
import { BookingEntity, BookingEntityPopulated } from "@/entities/booking.entity";
import { EventEntity } from "@/entities/event.entity";
import { UserEntity } from "@/entities/user.entity";
import { createHttpError } from "@/utils/httpError.utils";
import { USER_ROLES } from "@/constants/user-system.constants";
import { EVENT_FORMATS, EVENT_STATUSES } from "@/constants/event.constants";




// Validates if the user is allowed to make purchases.
export function validateUserEligibilityForBooking(user: UserEntity | null): void {
    if (!user) {
        throw createHttpError(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND);
    }
    if (user.isSuperAdmin) {
        throw createHttpError(HTTP_STATUS.FORBIDDEN, BOOKING_MESSAGES.SUPER_ADMIN_CANNOT_BOOK);
    }
    if (user.role === USER_ROLES.ADMIN) {
        throw createHttpError(HTTP_STATUS.FORBIDDEN, BOOKING_MESSAGES.ADMIN_CANNOT_BOOK);
    }
}



// Validates if the event is in a bookable and active state.
export function validateEventStatusForBooking(event: EventEntity | null, userId: string): asserts event is EventEntity {
    if (!event) {
        throw createHttpError(HTTP_STATUS.NOT_FOUND, EVENT_MESSAGES.EVENT_NOT_FOUND);
    }
    if (event.organizer.hostId.toString() === userId) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, BOOKING_MESSAGES.CANNOT_BOOK_OWN_EVENT);
    }
    if (event.eventStatus === EVENT_STATUSES.CANCELLED) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, EVENT_MESSAGES.EVENT_ALREADY_CANCELLED);
    }
    if (event.eventStatus === EVENT_STATUSES.SUSPENDED) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, EVENT_MESSAGES.EVENT_ALREADY_SUSPENDED);
    }
    if (event.eventStatus === EVENT_STATUSES.COMPLETED || event.endDateTime < new Date()) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, EVENT_MESSAGES.EVENT_ALREADY_ENDED);
    }
    if (event.eventStatus === EVENT_STATUSES.DRAFT) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, BOOKING_MESSAGES.EVENT_NOT_BOOKABLE);
    }
}




// Validates inventory capacity against the requested quantity.
export function validateTicketInventoryForBooking(quantity: number, ticketsLeft: number): void {
    if (ticketsLeft <= 0) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, BOOKING_MESSAGES.TICKETS_SOLD_OUT);
    }
    if (quantity > ticketsLeft) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, DYNAMIC_BOOKING_MESSAGES.NOT_ENOUGH_TICKETS(ticketsLeft));
    }
}



// Validates online/offline ticket purchase limits per booking and per user.
export function validateTicketLimitsForBooking(
    event: EventEntity,
    quantity: number,
    existingTicketCount: number
): void {
    if (event.format === EVENT_FORMATS.ONLINE) {
        if (quantity !== ONLINE_MAX_TICKETS_PER_USER) {
            throw createHttpError(HTTP_STATUS.BAD_REQUEST, BOOKING_MESSAGES.ONLINE_LIMIT_PER_USER);
        }
        if (existingTicketCount >= ONLINE_MAX_TICKETS_PER_USER) {
            throw createHttpError(HTTP_STATUS.CONFLICT, BOOKING_MESSAGES.ONLINE_LIMIT_EXCEEDED);
        }
    } else {
        if (quantity < MIN_TICKETS_PER_BOOKING) {
            throw createHttpError(HTTP_STATUS.BAD_REQUEST, BOOKING_MESSAGES.MIN_TICKETS_REQUIRED);
        }
        if (quantity > OFFLINE_MAX_TICKETS_PER_BOOKING) {
            throw createHttpError(HTTP_STATUS.BAD_REQUEST, BOOKING_MESSAGES.PER_BOOKING_LIMIT_EXCEEDED);
        }
        if (existingTicketCount + quantity > OFFLINE_MAX_TICKETS_PER_USER) {
            throw createHttpError(
                HTTP_STATUS.BAD_REQUEST,
                DYNAMIC_BOOKING_MESSAGES.PER_USER_LIMIT_EXCEEDED(existingTicketCount)
            );
        }
    }
}


// Validates if a booking exists, belongs to the correct user, and is in a valid state to retry.
export function validateRetryBookingState(
    booking: BookingEntityPopulated | null,
    userId: string
): asserts booking is BookingEntityPopulated {
    if (!booking) {
        throw createHttpError(HTTP_STATUS.NOT_FOUND, BOOKING_MESSAGES.BOOKING_NOT_FOUND);
    }
    if (booking.user.userId.toString() !== userId) {
        throw createHttpError(HTTP_STATUS.FORBIDDEN, "You do not have permission to retry this booking.");
    }
    if (booking.bookingStatus !== BOOKING_STATUSES.PENDING) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST, 
            `Cannot retry payment. Booking is already ${booking.bookingStatus}.`
        );
    }
}



export function validateInitiateBooking(
    user: UserEntity | null,
    event: EventEntity | null,
    bookingReqDto: BookingOrderRequestDTO,
    existingTicketCount: number,
    ticketsLeft: number
): asserts event is EventEntity {

    validateUserEligibilityForBooking(user);

    validateEventStatusForBooking(event, bookingReqDto.userId);

    validateTicketInventoryForBooking(bookingReqDto.quantity, ticketsLeft)

    validateTicketLimitsForBooking(event, bookingReqDto.quantity, existingTicketCount)

}



export function validateVerifyAndConfirmPayment(
    booking: BookingEntity | null,
    userId: string
): asserts booking is BookingEntity {
    if (!booking) {
        throw createHttpError(HTTP_STATUS.NOT_FOUND, "Booking not found for this order");
    }
    if (booking.userRef !== userId) {
        throw createHttpError(HTTP_STATUS.FORBIDDEN, "Unauthorized");
    }
    if (booking.bookingStatus !== BOOKING_STATUSES.PENDING) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, "This booking has already been processed");
    }
}



export function validateBookingCancellation(
    booking: BookingEntityPopulated | null
): asserts booking is BookingEntityPopulated {        
    if (!booking) {
        throw createHttpError(HTTP_STATUS.NOT_FOUND, BOOKING_MESSAGES.BOOKING_NOT_FOUND);
    }

    if (booking.bookingStatus === BOOKING_STATUSES.CANCELLED) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, BOOKING_MESSAGES.BOOKING_ALREADY_CANCELLED);
    }
    if (booking.bookingStatus === BOOKING_STATUSES.FAILED || 
        booking.bookingStatus === BOOKING_STATUSES.PENDING ||
        booking.bookingStatus === BOOKING_STATUSES.ATTENDED
    ) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, BOOKING_MESSAGES.CANCELLATION_NOT_ALLOWED);
    }
    if (booking.event.startDateTime <= new Date()) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, BOOKING_MESSAGES.CANCELLATION_WINDOW_CLOSED);
    }

    // QR scanning opens 30 min before startDateTime — entries may already
    // be consumed before the event-started guard above triggers.
    if (booking.remainingEntries === 0 || booking.quantity !== booking.remainingEntries) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, BOOKING_MESSAGES.CANNOT_CANCEL_AFTER_ENTRY);
    }
}



export function validateBookingCancelByUser(
    booking: BookingEntityPopulated | null,
    userId: string
): asserts booking is BookingEntityPopulated {
    validateBookingCancellation(booking);
    
    // the only additional validation is only booked user can cancel this booking         
    if (booking.user.userId !== userId) {
        throw createHttpError(HTTP_STATUS.FORBIDDEN, BOOKING_MESSAGES.UNAUTHORIZED_BOOKING_CANCELLATION);
    }
}



export function validateBookingCancelByAuthority(
    booking: BookingEntityPopulated | null
): asserts booking is BookingEntityPopulated {
    validateBookingCancellation(booking);
}




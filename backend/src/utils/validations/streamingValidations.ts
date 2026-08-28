// backend/src/utils/validations/streamingValidations.ts
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { EVENT_FORMATS, EVENT_STATUSES, ONLINE_EARLY_JOIN_BUFFER_MS } from "@/constants/event.constants";
import { EventEntity } from "@/entities/event.entity";
import { createHttpError } from "@/utils/httpError.utils";
import { EVENT_MESSAGES } from "@/constants/messages.constants";
import { ENTERABLE_STATUSES, SCANNABLE_EVENT_STATUSES } from "@/types/checkin.types";
import { BookingEntity } from "@/entities/booking.entity";




export function validateOnlineEventForJoin(event: EventEntity | null): asserts event is EventEntity {
    if (!event) {
        throw createHttpError(HTTP_STATUS.NOT_FOUND, EVENT_MESSAGES.EVENT_NOT_FOUND);
    }

    if (event.format !== EVENT_FORMATS.ONLINE) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Invalid online event.");
    }

    if (!SCANNABLE_EVENT_STATUSES.includes(event.eventStatus)) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST, 
            `Event is ${event.eventStatus}. The live room is not available.`
        );
    }

    const nowMs = Date.now();
    const startMs = event.startDateTime.getTime();
    const endMs = event.endDateTime.getTime();
    const joinOpenTimeMs = startMs - ONLINE_EARLY_JOIN_BUFFER_MS;

    // Check if the user is trying to join too early
    if (nowMs < joinOpenTimeMs) {
        const timeDiffMs = joinOpenTimeMs - nowMs;
        const minutesLeft = Math.ceil(timeDiffMs / (60 * 1000));
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST, 
            `The live room opens 15 minutes before the event starts. Please wait ${minutesLeft} more minutes.`
        );
    }

    // Check if the event has completely finished
    if (nowMs > endMs) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST, 
            "This event has already ended. The live room is closed."
        );
    }
}






export function validateOnlineBookingForJoin(booking: BookingEntity | null): asserts booking is BookingEntity {
    if (!booking) {
        throw createHttpError(HTTP_STATUS.FORBIDDEN, "No valid booking found for this event.");
    }

    if (!ENTERABLE_STATUSES.includes(booking.bookingStatus)) {
        throw createHttpError(
            HTTP_STATUS.FORBIDDEN, 
            `Your booking is ${booking.bookingStatus}. You cannot join the event.`
        );
    }
}
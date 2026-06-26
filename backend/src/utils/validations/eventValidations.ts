// backend/src/utils/validations/eventValidations.ts
import { EVENT_FORMATS, EVENT_STATUSES, EventStatus, TICKET_TYPES } from "@/constants/event.constants";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { AUTH_MESSAGES, EVENT_MESSAGES } from "@/constants/messages.constants";
import { CreateEventRequestDTO, UpdateEventRequestDTO } from "@/dtos/event.dto";
import { EventEntity } from "@/entities/event.entity";
import { getEventDisplayStatus } from "@/utils/eventStatus.utils";
import { createHttpError } from "@/utils/httpError.utils";



export function validateEventCreate (createDto: CreateEventRequestDTO, imageFile: Express.Multer.File | undefined): void {
    if (createDto.startDateTime >= createDto.endDateTime) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Event end time must be after start time");
    }

    if (createDto.format === EVENT_FORMATS.OFFLINE && !createDto.location) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Offline events must have a location" );
    }

    // if (createDto.format === EVENT_FORMATS.ONLINE && !createDto.onlineLink) {
    //     throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Online events must have an online link");
    // }

    if (createDto.ticketType === TICKET_TYPES.FREE && createDto.ticketPrice > 0) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Free events cannot have a ticket price.");
    }
    if (createDto.ticketType === TICKET_TYPES.PAID && createDto.ticketPrice <= 0) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Paid events must have a ticket price.");
    }

    if (!imageFile && !createDto.aiGeneratedImage) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Event poster is required");
    }
}



export function validateEventUpdateByHost(
    existingEvent: EventEntity | null,
    updateEventDto: UpdateEventRequestDTO,
    currentUserId: string,
    imageFile: Express.Multer.File | undefined
): asserts existingEvent is EventEntity {

    if (!existingEvent) {
        throw createHttpError(HTTP_STATUS.NOT_FOUND, EVENT_MESSAGES.EVENT_NOT_FOUND);
    }

    if (existingEvent.organizer.hostId !== currentUserId) {
        throw createHttpError(
            HTTP_STATUS.FORBIDDEN,
            "Only the event host can update this event"
        );
    }

    validateEventCoreUpdation(existingEvent, updateEventDto, imageFile);
}


export function validateEventUpdateByAdmin(
    existingEvent: EventEntity | null,
    updateEventDto: UpdateEventRequestDTO,
    imageFile: Express.Multer.File | undefined
): asserts existingEvent is EventEntity {
    validateEventCoreUpdation(existingEvent, updateEventDto, imageFile);
};


export function validateEventCoreUpdation(
    existingEvent: EventEntity | null,
    updateEventDto: UpdateEventRequestDTO,
    imageFile: Express.Multer.File | undefined
): asserts existingEvent is EventEntity {

    if (!existingEvent) {
        throw createHttpError(HTTP_STATUS.NOT_FOUND, EVENT_MESSAGES.EVENT_NOT_FOUND);
    }

    const now        = new Date();
    const isDraft    = existingEvent.eventStatus === EVENT_STATUSES.DRAFT;
    const isPublished= existingEvent.eventStatus === EVENT_STATUSES.PUBLISHED;
    const hasStarted = existingEvent.startDateTime <= now;
    const hasFinished= existingEvent.endDateTime   <= now || existingEvent.eventStatus === EVENT_STATUSES.COMPLETED;

    const effectiveStart = updateEventDto.startDateTime
        ? new Date(updateEventDto.startDateTime)
        : existingEvent.startDateTime;

    const effectiveEnd = updateEventDto.endDateTime
        ? new Date(updateEventDto.endDateTime)
        : existingEvent.endDateTime;

    const effectiveFormat      = updateEventDto.format      ?? existingEvent.format;
    const effectiveTicketType  = updateEventDto.ticketType  ?? existingEvent.ticketType;
    const effectiveTicketPrice = updateEventDto.ticketPrice ?? existingEvent.ticketPrice;

    const isChangingStartDate =
        !!updateEventDto.startDateTime &&
        new Date(updateEventDto.startDateTime).getTime() !== existingEvent.startDateTime.getTime();

    const isChangingEndDate =
        !!updateEventDto.endDateTime &&
        new Date(updateEventDto.endDateTime).getTime() !== existingEvent.endDateTime.getTime();

    const formatChanged =
        !!updateEventDto.format &&
        updateEventDto.format !== existingEvent.format;


    // ── TERMINAL STATUS GATE ─────────────────────────────────────────────────
    if (existingEvent.eventStatus === EVENT_STATUSES.CANCELLED) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            "This event has been cancelled and can no longer be edited."
        );
    }

    if (existingEvent.eventStatus === EVENT_STATUSES.SUSPENDED) {
        throw createHttpError(
            HTTP_STATUS.FORBIDDEN,
            "This event has been suspended. Editing is not allowed until the suspension is lifted."
        );
    }


    if (isPublished && hasFinished) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            "This event has already ended and can no longer be edited."
        );
    }


    // ── POST-START FIELD LOCKS ───────────────────────────────────────────────
    // Only applies to PUBLISHED events that have started.
    // Drafts with a past startDateTime (never published) are NOT locked —
    // they are caught further down by the draft date validation instead.
    if (isPublished && hasStarted) {

        // 🔒 title — locked
        if (updateEventDto.title !== undefined && updateEventDto.title.trim() !== existingEvent.title) {
            throw createHttpError(
                HTTP_STATUS.BAD_REQUEST,
                "Event title cannot be changed after the event has started."
            );
        }

        // 🔒 category — locked
        if (updateEventDto.category && updateEventDto.category !== existingEvent.category) {
            throw createHttpError(
                HTTP_STATUS.BAD_REQUEST,
                "Event category cannot be changed after the event has started."
            );
        }

        // 🔒 format — locked (case 1: started)
        if (formatChanged) {
            throw createHttpError(
                HTTP_STATUS.BAD_REQUEST,
                "Event format cannot be changed after the event has started."
            );
        }

        // 🔒 location — locked (people are already on their way)
        if (updateEventDto.locationName && updateEventDto.locationName !== existingEvent.locationName) {
            throw createHttpError(
                HTTP_STATUS.BAD_REQUEST,
                "Event venue cannot be changed after the event has started."
            );
        }

        if (updateEventDto.location && existingEvent.location) {
            const isCoordsChanged = 
                updateEventDto.location.coordinates[0] !== existingEvent.location?.coordinates[0] ||
                updateEventDto.location.coordinates[1] !== existingEvent.location?.coordinates[1];

            if (isCoordsChanged) {
                throw createHttpError(
                    HTTP_STATUS.BAD_REQUEST,
                    "You cannot relocate the event venue once the event has started."
                );
            }
        }

        // 🔒 startDateTime — locked (already passed)
        if (isChangingStartDate) {
            throw createHttpError(
                HTTP_STATUS.BAD_REQUEST,
                "Start date/time cannot be changed after the event has started."
            );
        }

        // 🔒 endDateTime — allow extend or shorten, but not to an already-past time
        if (isChangingEndDate && effectiveEnd <= now) {
            throw createHttpError(
                HTTP_STATUS.BAD_REQUEST,
                "End date/time cannot be set to a time that has already passed."
            );
        }

        // 🔒 ticketType — locked
        if (updateEventDto.ticketType && updateEventDto.ticketType !== existingEvent.ticketType) {
            throw createHttpError(
                HTTP_STATUS.BAD_REQUEST,
                "Ticket type cannot be changed after the event has started."
            );
        }

        // 🔒 ticketPrice — locked entirely
        if (
            updateEventDto.ticketPrice !== undefined &&
            updateEventDto.ticketPrice !== existingEvent.ticketPrice
        ) {
            throw createHttpError(
                HTTP_STATUS.BAD_REQUEST,
                "Ticket price cannot be changed after the event has started."
            );
        }
    }


    // ── DATE VALIDATION ──────────────────────────────────────────────────────
    if (effectiveStart >= effectiveEnd) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            "The end date/time must be later than the start date/time."
        );
    }

    // Draft: start date must always be in the future when saving.
    // This also catches drafts with a naturally-expired start date — the host
    // must update the start date before they can save anything else.
    if (isDraft && effectiveStart < now) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            "Start date & time cannot be in the past. Please update it before saving."
        );
    }

    // Published, not yet started: start date cannot be in the past.
    if (isPublished && !hasStarted && effectiveStart < now) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            "Start date/time cannot be set to a time that has already passed."
        );
    }


    // ── POSTER VALIDATION ──────────────────────────────────────────────────────
    const hasExistingPoster = !!existingEvent.posterUrl;
    const hasNewPoster = !!imageFile || !!updateEventDto.aiGeneratedImage;

    if (!hasExistingPoster && !hasNewPoster) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            "Event poster is required"
        );
    }


    // ── FORMAT LOCK (case 2: not started, tickets sold) ──────────────────────
    if (formatChanged && existingEvent.soldTickets > 0) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            "Cannot switch event format after tickets have been sold. " +
            "Cancel this event and create a new one."
        );
    }


    // ── CAPACITY ─────────────────────────────────────────────────────────────
    if (
        updateEventDto.capacity !== undefined &&
        updateEventDto.capacity < existingEvent.soldTickets
    ) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            `Capacity cannot be set below the number of tickets already sold (${existingEvent.soldTickets}).`
        );
    }


    // ── OFFLINE REQUIRES LOCATION ────────────────────────────────────────────
    if (effectiveFormat === EVENT_FORMATS.OFFLINE) {
        const hasLocation     = updateEventDto.location     ?? existingEvent.location;
        const hasLocationName = updateEventDto.locationName ?? existingEvent.locationName;
        if (!hasLocation || !hasLocationName) {
            throw createHttpError(
                HTTP_STATUS.BAD_REQUEST,
                "Offline events must have a venue location."
            );
        }
    }


    // ── TICKET TYPE / PRICE ──────────────────────────────────────────────────
    if (effectiveTicketType === TICKET_TYPES.FREE && effectiveTicketPrice > 0) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            "Free events cannot have a ticket price."
        );
    }

    if (effectiveTicketType === TICKET_TYPES.PAID && effectiveTicketPrice <= 0) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            "Paid events must have a ticket price greater than 0."
        );
    }
};


export function validateEventDelete(eventEntity: EventEntity | null): asserts eventEntity is EventEntity {
    if (!eventEntity){
        throw createHttpError(HTTP_STATUS.NOT_FOUND, EVENT_MESSAGES.EVENT_NOT_FOUND);
    }

    const eventStatus: EventStatus = getEventDisplayStatus(eventEntity);

    if (eventStatus !== EVENT_STATUSES.DRAFT) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, `Cannot delete a ${eventStatus.toLowerCase()} event.`);
    }
}


export function validateEventPublish(eventEntity: EventEntity | null, userId: string): asserts eventEntity is EventEntity {
    if (!eventEntity) {
        throw createHttpError(HTTP_STATUS.NOT_FOUND, EVENT_MESSAGES.EVENT_NOT_FOUND);
    }

    if (eventEntity.organizer.hostId !== userId) {
        throw createHttpError(
            HTTP_STATUS.FORBIDDEN,
            "Only the event host can publish this event"
        );
    }

    if (eventEntity.eventStatus !== EVENT_STATUSES.DRAFT) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            "Only draft events can be published"
        );
    }

    if (eventEntity.startDateTime <= new Date()) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            "This event's scheduled time has already passed. Please update the event date to publish."
        );
    }
}


export function validateEventSuspend(eventEntity: EventEntity | null): asserts eventEntity is EventEntity {
    if (!eventEntity) {
        throw createHttpError(HTTP_STATUS.NOT_FOUND, EVENT_MESSAGES.EVENT_NOT_FOUND);
    }

    // even draft event cannot suspend. but it can delete. (or can suspend it?? what is good ??)
    const allowedToSuspend = 
        eventEntity.eventStatus === EVENT_STATUSES.PUBLISHED &&
        eventEntity.endDateTime > new Date();

    if (!allowedToSuspend) {
        const displayStatus: EventStatus = getEventDisplayStatus(eventEntity);
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            `Cannot suspend an event with status "${displayStatus}"`
        );
    }
}


export function validateEventCancel(eventEntity: EventEntity | null, userId: string): asserts eventEntity is EventEntity {
    if (!eventEntity) {
        throw createHttpError(HTTP_STATUS.NOT_FOUND, EVENT_MESSAGES.EVENT_NOT_FOUND);
    }

    if (eventEntity.organizer.hostId !== userId){
        throw createHttpError(HTTP_STATUS.FORBIDDEN, AUTH_MESSAGES.UNAUTHORIZED_ACCESS);
    }

    // even draft event cannot cancel. but it can delete. (or can cancel draft events)
    const allowedToCancel = 
        eventEntity.eventStatus === EVENT_STATUSES.PUBLISHED && 
        eventEntity.endDateTime > new Date();
        
    if (!allowedToCancel) {
        const displayStatus: EventStatus = getEventDisplayStatus(eventEntity);
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST,
            `Cannot cancel an event with status "${displayStatus}"`
        );
    }
}
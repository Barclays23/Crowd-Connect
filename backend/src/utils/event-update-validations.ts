// backend/src/utils/event-update-validations.ts

import { HttpStatus } from "@/constants/statusCodes.constants";
import { UpdateEventRequestDTO } from "@/dtos/event.dto";
import { EventEntity } from "@/entities/event.entity";
import { EVENT_FORMAT, EVENT_STATUS, TICKET_TYPE } from "@/types/event.types";
import { createHttpError } from "@/utils/httpError.utils";

export const validateEventUpdate = (
    existingEvent: EventEntity,
    updateEventDto: UpdateEventRequestDTO
): void => {

    const now        = new Date();
    const isDraft    = existingEvent.eventStatus === EVENT_STATUS.DRAFT;
    const isPublished= existingEvent.eventStatus === EVENT_STATUS.PUBLISHED;
    const hasStarted = existingEvent.startDateTime <= now;
    const hasFinished= existingEvent.endDateTime   <= now;

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
    if (existingEvent.eventStatus === EVENT_STATUS.CANCELLED) {
        throw createHttpError(
            HttpStatus.BAD_REQUEST,
            "This event has been cancelled and can no longer be edited."
        );
    }

    if (existingEvent.eventStatus === EVENT_STATUS.SUSPENDED) {
        throw createHttpError(
            HttpStatus.FORBIDDEN,
            "This event has been suspended. Editing is not allowed until the suspension is lifted."
        );
    }

    if (existingEvent.eventStatus === EVENT_STATUS.COMPLETED) {
        throw createHttpError(
            HttpStatus.BAD_REQUEST,
            "This event has already completed and can no longer be edited."
        );
    }

    if (isPublished && hasFinished) {
        throw createHttpError(
            HttpStatus.BAD_REQUEST,
            "This event has already ended and can no longer be edited."
        );
    }


    // ── POST-START FIELD LOCKS ───────────────────────────────────────────────
    // Only applies to PUBLISHED events that have started.
    // Drafts with a past startDateTime (never published) are NOT locked —
    // they are caught further down by the draft date validation instead.
    if (isPublished && hasStarted) {

        // 🔒 title — locked
        if (updateEventDto.title && updateEventDto.title.trim() !== existingEvent.title) {
            throw createHttpError(
                HttpStatus.BAD_REQUEST,
                "Event title cannot be changed after the event has started."
            );
        }

        // 🔒 category — locked
        if (updateEventDto.category && updateEventDto.category !== existingEvent.category) {
            throw createHttpError(
                HttpStatus.BAD_REQUEST,
                "Event category cannot be changed after the event has started."
            );
        }

        // 🔒 format — locked (case 1: started)
        if (formatChanged) {
            throw createHttpError(
                HttpStatus.BAD_REQUEST,
                "Event format cannot be changed after the event has started."
            );
        }

        // 🔒 location — locked (people are already on their way)
        if (updateEventDto.locationName && updateEventDto.locationName !== existingEvent.locationName) {
            throw createHttpError(
                HttpStatus.BAD_REQUEST,
                "Event venue cannot be changed after the event has started."
            );
        }

        if (updateEventDto.location) {
            const isCoordsChanged = 
                updateEventDto.location.coordinates[0] !== existingEvent.location?.coordinates[0] ||
                updateEventDto.location.coordinates[1] !== existingEvent.location?.coordinates[1];

            if (isCoordsChanged) {
                throw createHttpError(
                    HttpStatus.BAD_REQUEST,
                    "You cannot relocate the event venue once the event has started."
                );
            }
        }

        // 🔒 startDateTime — locked (already passed)
        if (isChangingStartDate) {
            throw createHttpError(
                HttpStatus.BAD_REQUEST,
                "Start date/time cannot be changed after the event has started."
            );
        }

        // 🔒 endDateTime — allow extend or shorten, but not to an already-past time
        if (isChangingEndDate && effectiveEnd <= now) {
            throw createHttpError(
                HttpStatus.BAD_REQUEST,
                "End date/time cannot be set to a time that has already passed."
            );
        }

        // 🔒 ticketType — locked
        if (updateEventDto.ticketType && updateEventDto.ticketType !== existingEvent.ticketType) {
            throw createHttpError(
                HttpStatus.BAD_REQUEST,
                "Ticket type cannot be changed after the event has started."
            );
        }

        // 🔒 ticketPrice — locked entirely
        if (
            updateEventDto.ticketPrice !== undefined &&
            updateEventDto.ticketPrice !== existingEvent.ticketPrice
        ) {
            throw createHttpError(
                HttpStatus.BAD_REQUEST,
                "Ticket price cannot be changed after the event has started."
            );
        }
    }


    // ── DATE VALIDATION ──────────────────────────────────────────────────────
    if (effectiveStart >= effectiveEnd) {
        throw createHttpError(
            HttpStatus.BAD_REQUEST,
            "The end date/time must be later than the start date/time."
        );
    }

    // Draft: start date must always be in the future when saving.
    // This also catches drafts with a naturally-expired start date — the host
    // must update the start date before they can save anything else.
    if (isDraft && effectiveStart < now) {
        throw createHttpError(
            HttpStatus.BAD_REQUEST,
            "Start date & time cannot be in the past. Please update it before saving."
        );
    }

    // Published, not yet started: start date cannot be in the past.
    if (isPublished && !hasStarted && effectiveStart < now) {
        throw createHttpError(
            HttpStatus.BAD_REQUEST,
            "Start date/time cannot be set to a time that has already passed."
        );
    }


    // ── FORMAT LOCK (case 2: not started, tickets sold) ──────────────────────
    if (formatChanged && existingEvent.soldTickets > 0) {
        throw createHttpError(
            HttpStatus.BAD_REQUEST,
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
            HttpStatus.BAD_REQUEST,
            `Capacity cannot be set below the number of tickets already sold (${existingEvent.soldTickets}).`
        );
    }


    // ── OFFLINE REQUIRES LOCATION ────────────────────────────────────────────
    if (effectiveFormat === EVENT_FORMAT.OFFLINE) {
        const hasLocation     = updateEventDto.location     ?? existingEvent.location;
        const hasLocationName = updateEventDto.locationName ?? existingEvent.locationName;
        if (!hasLocation || !hasLocationName) {
            throw createHttpError(
                HttpStatus.BAD_REQUEST,
                "Offline events must have a venue location."
            );
        }
    }


    // ── TICKET TYPE / PRICE ──────────────────────────────────────────────────
    if (effectiveTicketType === TICKET_TYPE.FREE && effectiveTicketPrice > 0) {
        throw createHttpError(
            HttpStatus.BAD_REQUEST,
            "Free events cannot have a ticket price."
        );
    }

    if (effectiveTicketType === TICKET_TYPE.PAID && effectiveTicketPrice <= 0) {
        throw createHttpError(
            HttpStatus.BAD_REQUEST,
            "Paid events must have a ticket price greater than 0."
        );
    }
};
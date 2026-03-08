// backend/src/utils/event-change-detector.ts

import { UpdateEventRequestDTO } from "@/dtos/event.dto";
import { EventEntity } from "@/entities/event.entity";

export interface DetectedChange {
    field: "STARTDATETIME" | "ENDDATETIME" | "VENUE" | "LOCATION" | "TICKETPRICE";
    // ↑ Removed FORMAT — format switch is BLOCKED entirely, not grace-period eligible.
    // bcoz: if once anyone booked the event, cannot switch format (ONLINE/OFFLINE). So, wont affect users.
    oldValue: string;
    newValue: string;
}

const LOCATION_CHANGE_DISTANCE_KM = 2;

const haversineDistanceKm = (
    [lng1, lat1]: [number, number],
    [lng2, lat2]: [number, number]
): number => {
    const R    = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDateTime = (d: Date) =>
    d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

export const detectMajorEventChanges = (
    existingEvent: EventEntity,
    updateEventDto: UpdateEventRequestDTO
): DetectedChange[] => {
    const changes: DetectedChange[] = [];

    // ── Start date/time changed ──────────────────────────────────────────────
    if (updateEventDto.startDateTime) {
        const oldStart = existingEvent.startDateTime.getTime();
        const newStart = new Date(updateEventDto.startDateTime).getTime();
        if (oldStart !== newStart) {
            changes.push({
                field:    "STARTDATETIME",
                oldValue: formatDateTime(existingEvent.startDateTime),
                newValue: formatDateTime(new Date(updateEventDto.startDateTime)),
            });
        }
    }

    // ── End date/time changed ────────────────────────────────────────────────
    if (updateEventDto.endDateTime) {
        const oldEnd = existingEvent.endDateTime.getTime();
        const newEnd = new Date(updateEventDto.endDateTime).getTime();
        if (oldEnd !== newEnd) {
            changes.push({
                field:    "ENDDATETIME",
                oldValue: formatDateTime(existingEvent.endDateTime),
                newValue: formatDateTime(new Date(updateEventDto.endDateTime)),
            });
        }
    }

    // ── Venue name changed ───────────────────────────────────────────────────
    if (
        updateEventDto.locationName &&
        updateEventDto.locationName !== existingEvent.locationName
    ) {
        changes.push({
            field:    "VENUE",
            oldValue: existingEvent.locationName || "—",
            newValue: updateEventDto.locationName,
        });
    }

    // ── Location coordinates moved significantly ─────────────────────────────
    // Use existing format as fallback — if format isn't in the DTO, the event
    // format hasn't changed and we should still use the current one.
    const effectiveFormat = updateEventDto.format ?? existingEvent.format;

    if (
        updateEventDto.location?.coordinates &&
        existingEvent.location?.coordinates &&
        effectiveFormat !== "online" // coordinates irrelevant for online events
    ) {
        const distanceKm = haversineDistanceKm(
            existingEvent.location.coordinates as [number, number],
            updateEventDto.location.coordinates as [number, number]
        );
        if (distanceKm > LOCATION_CHANGE_DISTANCE_KM) {
            changes.push({
                field:    "LOCATION",
                oldValue: `${existingEvent.location.coordinates[1]}, ${existingEvent.location.coordinates[0]}`,
                newValue: `${updateEventDto.location.coordinates[1]}, ${updateEventDto.location.coordinates[0]}`,
            });
        }
    }

    // ── Ticket price DECREASED ───────────────────────────────────────────────
    // Only trigger when newPrice < existingPrice.
    //   Price increase  → NOT major (existing bookers locked at their snapshot price)
    //   Free → Paid     → NOT major (newPrice 200 is NOT < 0, existing bookers still attend free)
    //   Paid → Free     → IS major  (0 IS < existingPrice, existing paid bookers deserve refund option)
    if (
        updateEventDto.ticketPrice !== undefined &&
        updateEventDto.ticketPrice < existingEvent.ticketPrice
    ) {
        const fmtPrice = (type: string, price: number) =>
            type === "free" ? "Free" : `₹${price}`;

        changes.push({
            field:    "TICKETPRICE",
            oldValue: fmtPrice(existingEvent.ticketType, existingEvent.ticketPrice),
            newValue: fmtPrice(
                updateEventDto.ticketType ?? existingEvent.ticketType,
                updateEventDto.ticketPrice
            ),
        });
    }

    return changes;
};

export const buildChangeSummary = (changes: DetectedChange[]): string => {
    const parts = changes.map((c) => {
        switch (c.field) {
            case "STARTDATETIME": return `start time changed to ${c.newValue}`;
            case "ENDDATETIME":   return `end time changed to ${c.newValue}`;
            case "VENUE":         return `venue changed to "${c.newValue}"`;
            case "LOCATION":      return `event location moved significantly`;
            case "TICKETPRICE":   return `ticket price reduced from ${c.oldValue} to ${c.newValue}`;
            default:              return "other details updated";
        }
    });
    return `Event updated: ${parts.join(", ")}.`;
};
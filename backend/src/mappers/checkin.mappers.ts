// backend/src/mappers/checkin.mapper.ts
import { BOOKING_STATUS } from "@/types/booking.types";
import {
  CheckInBookingPopulated,
  CheckInResultDTO,
  AttendanceRecord,
  BookingQrLean,
  AttendanceLean,
} from "@/types/checkin.types";




// Lean DB result → domain object consumed by CheckinService.
export function mapBookingLeanToCheckInPopulated(
    booking: BookingQrLean,
): CheckInBookingPopulated {
    return {
        bookingId:        booking._id.toString(),
        ticketNo:         booking.ticketNo,
        bookingStatus:    booking.bookingStatus,
        quantity:         booking.quantity,
        remainingEntries: booking.remainingEntries,
        checkedInAt:      booking.checkedInAt,
        userRef: {
            userId: booking.userRef._id.toString(),
            name:   booking.userRef.name,
            email:  booking.userRef.email,
        },
        eventRef: {
            eventId:       booking.eventRef._id.toString(),
            title:         booking.eventRef.title,
            startDateTime: booking.eventRef.startDateTime,
            endDateTime:   booking.eventRef.endDateTime,
            eventStatus:   booking.eventRef.eventStatus,
        },
    };
}



// Lean DB result → AttendanceRecord for the attendance list tab.
export function mapAttendanceLeanToRecord(booking: AttendanceLean): AttendanceRecord {
    const entriesUsed = booking.quantity - booking.remainingEntries;

    return {
        bookingId:        booking._id.toString(),
        ticketNo:         booking.ticketNo,
        attendeeName:     booking.userRef.name,
        attendeeEmail:    booking.userRef.email,
        quantity:         booking.quantity,
        entriesUsed,
        remainingEntries: booking.remainingEntries,
        isFullyUsed:      booking.remainingEntries === 0,
        checkedInAt:      booking.checkedInAt!,
        bookingStatus:    booking.bookingStatus,
    };
}



// Domain object + computed values → response DTO returned to the controller.
export function mapToCheckInResultDTO(
    booking:              CheckInBookingPopulated,
    entriesThisScan:      number,
    newRemainingEntries:  number,
    newBookingStatus:     BOOKING_STATUS,
    checkedInAt:          Date,
): CheckInResultDTO {
    return {
        bookingId:        booking.bookingId,
        ticketNo:         booking.ticketNo,
        attendeeName:     booking.userRef.name,
        attendeeEmail:    booking.userRef.email,
        quantity:         booking.quantity,
        entriesThisScan,
        remainingEntries: newRemainingEntries,
        isFullyUsed:      newRemainingEntries === 0,
        bookingStatus:    newBookingStatus,
        checkedInAt,
    };
}
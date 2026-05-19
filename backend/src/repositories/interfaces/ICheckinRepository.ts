// backend/src/repositories/interfaces/ICheckinRepository.ts

import { BookingEntity } from "@/entities/booking.entity";
import { BookingCheckinUpdate } from "@/types/booking.types";
import { CheckInBookingPopulated, AttendanceRecord } from "@/types/checkin.types";



export interface ICheckinRepository {
    // Find a booking by its QR token, populated with user + event refs.
    findBookingByQrToken(qrToken: string): Promise<CheckInBookingPopulated | null>;


    // Return all bookings for an event that have been scanned at least once
    // (checkedInAt is set), sorted by checkedInAt desc.
    getEventAttendance(eventId: string): Promise<AttendanceRecord[]>;

    // Atomically decrement remainingEntries, bookingStatus, checkedinAt — used during QR scan
    applyCheckInUpdate(checkinUpdate: BookingCheckinUpdate): Promise<BookingEntity | null>;
}
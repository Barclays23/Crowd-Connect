// backend/src/types/checkin.types.ts

import { BOOKING_STATUS } from "@/types/booking.types";
import { EVENT_STATUS } from "@/types/event.types";
import { Types } from "mongoose";



// Allow scanning up to 30 minutes before the event starts
export const EARLY_CHECKIN_BUFFER_MS = 30 * 60 * 1000;

// Booking statuses that are permit for entry
export const ENTERABLE_STATUSES: BOOKING_STATUS[] = [
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.ATTENDED,  // partial re-scan still valid while remainingEntries > 0
];


// Event statuses that permit scanning
// PUBLISHED is included because your DB stores PUBLISHED; display layer computes upcoming/ongoing
export const SCANNABLE_EVENT_STATUSES: string[] = [
  EVENT_STATUS.PUBLISHED,
  EVENT_STATUS.UPCOMING,
  EVENT_STATUS.ONGOING,
];


// ─── Controller → Service ───────────────────────────────────────────────
export interface ScanQRInput {
    qrToken     : string;
    entryCount  : number; // how many people entering this single scan (partial group support)
}


// ─── Service → Controller ─────────────────────────────────────────────
export interface CheckInResultDTO {
    bookingId:        string;
    ticketNo:         string;
    attendeeName:     string;
    attendeeEmail:    string;
    quantity:         number;   // total tickets on this booking
    entriesThisScan:  number;   // how many entered just now
    remainingEntries: number;   // after this scan
    isFullyUsed:      boolean;  // remainingEntries === 0
    bookingStatus:    BOOKING_STATUS;
    checkedInAt:      Date;
}





// ─── Attendance list item (for the host's live attendance panel) ──────────────
export interface AttendanceRecord {
    bookingId:        string;
    ticketNo:         string;
    attendeeName:     string;
    attendeeEmail:    string;
    quantity:         number;
    entriesUsed:      number;   // quantity - remainingEntries
    remainingEntries: number;
    isFullyUsed:      boolean;
    checkedInAt:      Date;
    bookingStatus:    BOOKING_STATUS;
}



export interface GetAttendanceResult {
    attendanceRecords   : AttendanceRecord[];
    totalChecked        : number; // sum of (quantity - remainingEntries) across all scanned bookings
}




// ─── Populated shape used internally by the repository ───────────────────────
export interface CheckInBookingPopulated {
    bookingId:              string;
    ticketNo:         string;
    bookingStatus:    BOOKING_STATUS;
    quantity:         number;
    remainingEntries: number;
    checkedInAt?:     Date;
    userRef: {
        userId:   string;
        name:  string;
        email: string;
    };
    eventRef: {
        eventId:       string;
        title:         string;
        startDateTime: Date;
        endDateTime:   Date;
        eventStatus:   EVENT_STATUS;
    };
}




// ─── Raw lean types ───────────────────────────────────────────────────────────
// Mongoose returns after .populate().lean().
export type BookingQrLean = {
  _id:              Types.ObjectId;
  ticketNo:         string;
  bookingStatus:    BOOKING_STATUS;
  quantity:         number;
  remainingEntries: number;
  checkedInAt?:     Date;
  userRef: {
    _id:   Types.ObjectId;
    name:  string;
    email: string;
  };
  eventRef: {
    _id:           Types.ObjectId;
    title:         string;
    startDateTime: Date;
    endDateTime:   Date;
    eventStatus:   EVENT_STATUS;
  };
};



export type AttendanceLean = {
  _id:              Types.ObjectId;
  ticketNo:         string;
  bookingStatus:    BOOKING_STATUS;
  quantity:         number;
  remainingEntries: number;
  checkedInAt?:     Date;
  userRef: {
    name:  string;
    email: string;
  };
};
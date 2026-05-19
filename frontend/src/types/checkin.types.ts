// frontend/src/types/checkin.types.ts

import { BOOKING_STATUS } from "@/types/booking.types";


export interface CheckInResult {
  bookingId:        string;
  ticketNo:         string;
  attendeeName:     string;
  attendeeEmail:    string;
  quantity:         number;
  entriesThisScan:  number;
  remainingEntries: number;
  isFullyUsed:      boolean;
  bookingStatus:    BOOKING_STATUS;
  checkedInAt:      string; // ISO string from JSON
}



export interface AttendanceRecord {
  bookingId:        string;
  ticketNo:         string;
  attendeeName:     string;
  attendeeEmail:    string;
  quantity:         number;
  entriesUsed:      number;
  remainingEntries: number;
  isFullyUsed:      boolean;
  checkedInAt:      string;
  bookingStatus:    BOOKING_STATUS;
}



export interface GetAttendanceResult {
  attendanceRecords:      AttendanceRecord[];
  totalChecked: number;
}



export type CheckInScanState =
  | { status: "idle" }
  | { status: "scanning" }
  | { status: "confirming"; rawToken: string }  // QR detected, awaiting entry count
  | { status: "loading" }
  | { status: "success"; result: CheckInResult }
  | { status: "error"; code: string; message: string };
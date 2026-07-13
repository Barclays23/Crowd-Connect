// frontend/src/types/checkin.types.ts

import type { BookingStatus } from "@/constants/booking.constants";



// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface ScanQRCodePayload {
  eventId:    string;
  qrToken:    string;
  entryCount: number;
}



// ─── Resonse Data Payloads (The 'T' in ApiResponse<T>) ────────────────────────────────
export interface CheckInResult {
  bookingId:        string;
  ticketNo:         string;
  attendeeName:     string;
  attendeeEmail:    string;
  quantity:         number;
  entriesThisScan:  number;
  remainingEntries: number;
  isFullyUsed:      boolean;
  bookingStatus:    BookingStatus;
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
  bookingStatus:    BookingStatus;
}



export interface GetAttendanceResult {
  attendanceRecords : AttendanceRecord[];
  totalChecked      : number;
}




// ─── Component States ─────────────────────────────────────────────────────────

export type CheckInScanState =
  | { status: "idle" }
  | { status: "scanning" }
  | { status: "confirming"; rawToken: string }  // QR detected, awaiting entry count
  | { status: "loading" }
  | { status: "success"; result: CheckInResult }
  | { status: "error"; code: string; message: string };
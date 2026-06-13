// backend/src/services/checkin-services/interfaces/ICheckinService.ts

import {
  ScanQRInput,
  CheckInResultDTO,
  GetAttendanceResult,
} from "@/types/checkin.types";



export interface ICheckinService {
  // Validate and process a QR scan (with qrToken + entryCount & eventId).
  scanQRCode(qrScanInput: ScanQRInput, hostEventId: string): Promise<CheckInResultDTO>;

  // Return all attendance records for an event (bookings that were scanned).
  getEventAttendance(eventId: string): Promise<GetAttendanceResult>;
}
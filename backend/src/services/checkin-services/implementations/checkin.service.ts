// backend/src/services/implementations/checkin.service.ts

import jwt                  from "jsonwebtoken";
import { BOOKING_STATUS, BookingCheckinUpdate }   from "@/types/booking.types";
import { EVENT_STATUS }     from "@/types/event.types";
import {
  ICheckinRepository,
} from "@/repositories/interfaces/ICheckinRepository";
import {
  ScanQRInput,
  CheckInResultDTO,
  GetAttendanceResult,
  AttendanceRecord,
  EARLY_CHECKIN_BUFFER_MS,
  CheckInBookingPopulated,
  ENTERABLE_STATUSES,
  SCANNABLE_EVENT_STATUSES,
} from "@/types/checkin.types";
import { QRTokenPayload } from "@/types/ticket.types";
import { ICheckinService } from "@/services/checkin-services/interfaces/ICheckinService";
import { IBookingRepository } from "@/repositories/interfaces/IBookingRepository";
import { IEventRepository } from "@/repositories/interfaces/IEventRepository";
import { createHttpError } from "@/utils/httpError.utils";
import { HttpStatus } from "@/constants/statusCodes.constants";
import { validateBookingForCheckIn, validateEventForCheckIn, validateQrEventMatch, validateScanQRInput } from "@/utils/validations/checkinValidations";
import { verifyQrToken } from "@/utils/jwt.utils";
import { mapToCheckInResultDTO } from "@/mappers/checkin.mappers";



export class CheckinService implements ICheckinService {

    constructor(
        private readonly _checkinRepo   :  ICheckinRepository,
        private readonly _eventRepo     :  IEventRepository,
    ) {}


    async scanQRCode(input: ScanQRInput, hostEventId: string): Promise<CheckInResultDTO> {
        const { qrToken, entryCount } = input;

        validateScanQRInput(qrToken, entryCount);

        const payload: QRTokenPayload = verifyQrToken(qrToken);

        validateQrEventMatch(payload.eventId, hostEventId);

        const booking: CheckInBookingPopulated | null = await this._checkinRepo.findBookingByQrToken(qrToken);
        if (!booking) {
            throw createHttpError(HttpStatus.NOT_FOUND, "Booking not found.");
        }

        validateBookingForCheckIn(booking, entryCount);

        validateEventForCheckIn(booking.eventRef);


        // ── 8. Process check-in ────────────────────────────────────────────────────
        const isFirstScan         = !booking.checkedInAt;
        const newRemainingEntries = booking.remainingEntries - entryCount;
        const newBookingStatus    = newRemainingEntries === 0 ? BOOKING_STATUS.ATTENDED : booking.bookingStatus;
        const checkedInAt         = isFirstScan ? new Date() : booking.checkedInAt!;

        const checkinUpdateInput: BookingCheckinUpdate = {
            bookingId: booking.bookingId,
            entryCount,
            newStatus: newBookingStatus,
            checkedInAt: isFirstScan ? checkedInAt : undefined,  // only stamp checkedInAt on first scan
        }

        await this._checkinRepo.applyCheckInUpdate(checkinUpdateInput);

        await this._eventRepo.incrementEventCheckedInCount(hostEventId, entryCount);

        return mapToCheckInResultDTO(
            booking,
            entryCount,
            newRemainingEntries,
            newBookingStatus,
            checkedInAt,
        );
    }


    async getEventAttendance(eventId: string): Promise<GetAttendanceResult> {
        const attendanceRecords: AttendanceRecord[] = await this._checkinRepo.getEventAttendance(eventId);

        const totalChecked = attendanceRecords.reduce((sum, r) => sum + r.entriesUsed, 0);

        return { attendanceRecords, totalChecked };
    }
}
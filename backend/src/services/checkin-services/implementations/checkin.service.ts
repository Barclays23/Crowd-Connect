// backend/src/services/implementations/checkin.service.ts
import { BookingCheckinUpdate }   from "@/types/booking.types";
import {
  ICheckinRepository,
} from "@/repositories/interfaces/ICheckinRepository";
import {
  ScanQRInput,
  CheckInResultDTO,
  GetAttendanceResult,
  AttendanceRecord,
  CheckInBookingPopulated,
} from "@/types/checkin.types";
import { QRTokenPayload } from "@/types/ticket.types";
import { ICheckinService } from "@/services/checkin-services/interfaces/ICheckinService";
import { IEventRepository } from "@/repositories/interfaces/IEventRepository";
import { createHttpError } from "@/utils/httpError.utils";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { 
    validateBookingForCheckIn, 
    validateEventForCheckIn, 
    validateQrEventMatch, 
    validateScanQRInput 
} from "@/utils/validations/checkinValidations";
import { verifyQrToken } from "@/utils/jwt.utils";
import { mapToCheckInResultDTO } from "@/mappers/checkin.mappers";
import { BOOKING_STATUSES } from "@/constants/booking.constants";



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
            throw createHttpError(HTTP_STATUS.NOT_FOUND, "Booking not found.");
        }

        validateBookingForCheckIn(booking, entryCount);

        validateEventForCheckIn(booking.eventRef);


        // ── 8. Process check-in ────────────────────────────────────────────────────
        const isFirstScan         = !booking.checkedInAt;
        const newRemainingEntries = booking.remainingEntries - entryCount;
        const newBookingStatus    = newRemainingEntries === 0 ? BOOKING_STATUSES.ATTENDED : booking.bookingStatus;
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
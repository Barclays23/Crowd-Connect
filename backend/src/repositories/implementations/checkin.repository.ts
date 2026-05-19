// backend/src/repositories/implementations/checkin.repository.ts

import { Types }       from "mongoose";
import { BookingCheckinUpdate, IBookingModel } from "@/types/booking.types";
import {
    ICheckinRepository,
} from "@/repositories/interfaces/ICheckinRepository";
import { BaseRepository } from "@/repositories/base.repository";
import {
  CheckInBookingPopulated,
  AttendanceRecord,
  BookingQrLean,
  AttendanceLean,
} from "@/types/checkin.types";
import Booking from "@/models/implementations/booking.model";
import { mapAttendanceLeanToRecord, mapBookingLeanToCheckInPopulated } from "@/mappers/checkin.mappers";
import { BookingEntity } from "@/entities/booking.entity";
import { mapBookingModelToEntity } from "@/mappers/booking.mapper";





export class CheckinRepository extends BaseRepository<IBookingModel> implements ICheckinRepository {
    constructor (){
        super(Booking);
    }


    async findBookingByQrToken(qrToken: string): Promise<CheckInBookingPopulated | null> {
        const booking: BookingQrLean | null = await this.findOneQuery({ qrToken })
            .populate<Pick<BookingQrLean, "userRef">>("userRef", "name email")
            .populate<Pick<BookingQrLean, "eventRef">>(
                "eventRef",
                "title startDateTime endDateTime eventStatus"
            )
            .lean<BookingQrLean>();

        if (!booking) return null;

        return mapBookingLeanToCheckInPopulated(booking);
    }


    async getEventAttendance(eventId: string): Promise<AttendanceRecord[]> {
        const bookings = await this.findManyQuery({
            eventRef:    new Types.ObjectId(eventId),
            checkedInAt: { $exists: true, $ne: null },
        })
        .populate<Pick<AttendanceLean, "userRef">>("userRef", "name email")
        .sort({ checkedInAt: -1 })
        .lean<AttendanceLean[]>();

        return bookings.map(mapAttendanceLeanToRecord);
    }



    async applyCheckInUpdate(checkinUpdate: BookingCheckinUpdate): Promise<BookingEntity | null> {
        const {bookingId, entryCount, newStatus, checkedInAt} = checkinUpdate;

        const updatedBooking: IBookingModel | null = await this.findByIdAndUpdate(
            bookingId,
            {
                $inc: { remainingEntries: -entryCount },
                $set: {
                    bookingStatus: newStatus,
                    ...(checkedInAt !== undefined && { checkedInAt }), // Only include checkedInAt if this is the first scan
                },
            },
        );

        return updatedBooking ? mapBookingModelToEntity(updatedBooking) : null;
    }
}
// services/ticket-services/implementations/ticket.service.ts

import jwt from "jsonwebtoken";
import { ITicketService, ValidateQrResult } from "../interfaces/ITicketService";
import { createHttpError } from "@/utils/httpError.utils";
import { HttpStatus } from "@/constants/statusCodes.constants";
import { IBookingRepository } from "@/repositories/interfaces/IBookingRepository";
import { IEventRepository } from "@/repositories/interfaces/IEventRepository";
import { BOOKING_STATUS } from "@/types/booking.types";
import { EVENT_FORMAT, EVENT_STATUS } from "@/types/event.types";



export class TicketService implements ITicketService {
    constructor(
        private readonly _bookingRepository: IBookingRepository,
        private readonly _eventRepository: IEventRepository
    ) {}

    generateQrToken({ userId, eventId, bookingId }: {
        userId:   string;
        eventId:  string;
        bookingId: string;
    }): string {
        const toketPayload = { bookingId, eventId, userId };

        const generatedQRString = jwt.sign(
            toketPayload,
            process.env.JWT_QRCODE_SECRET!,
            // { expiresIn: "90d" } // NOTICE: No 'expiresIn' option here. Time windows are checked live in the DB.
        );
        console.log('generatedQRString:', generatedQRString)
        return generatedQRString;
    }


    generateTicketNo(): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const random = Array.from({ length: 8 }, () =>
            chars[Math.floor(Math.random() * chars.length)]
        ).join("");

        return `CC-${random}`; // e.g. CC-X7KP2QAM
    }


    async validateQrToken(qrToken: string, scanQuantity: number): Promise<ValidateQrResult> {
        try {
            // 1. Verify the JWT signature (This will throw if tampered with)
            const decoded = jwt.verify(qrToken, process.env.JWT_QRCODE_SECRET!) as {
                bookingId: string;
                eventId: string;
                userId: string;
            };

            // 2. Fetch live data from DB using the decoded bookingId [cite: 186]
            const booking = await this._bookingRepository.getBookingById(decoded.bookingId);
            if (!booking) {
                throw createHttpError(HttpStatus.NOT_FOUND, "Booking not found.");
            }

            const event = await this._eventRepository.getEventById(decoded.eventId);
            if (!event) {
                throw createHttpError(HttpStatus.NOT_FOUND, "Event not found.");
            }

            // 3. Security & Status Checks [cite: 193]
            if (booking.bookingStatus === BOOKING_STATUS.CANCELLED) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "This booking has been cancelled.");
            }
            if (booking.bookingStatus === BOOKING_STATUS.FAILED) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "This booking payment failed and is invalid.");
            }

            if (event.eventStatus === EVENT_STATUS.CANCELLED) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "This event is currently cancelled.");
            }
            if (event.eventStatus === EVENT_STATUS.SUSPENDED) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "This event is currently suspended.");
            }

            // 4. Live Time Window Check (No exp in JWT!) 
            const now = new Date();
            // Optional: You might want to allow scanning 1 hour before the start time
            const scanWindowStart = new Date(event.startDateTime.getTime() - 60 * 60 * 1000); 
            
            if (now < scanWindowStart) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Too early! The event hasn't started yet.");
            }
            if (now > event.endDateTime) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Event has already ended. QR code is expired.");
            }

            // 5. Entry Capacity Checks [cite: 189, 190]
            if (booking.remainingEntries === 0) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "All tickets for this booking have already been used.");
            }
            if (scanQuantity > booking.remainingEntries) {
                throw createHttpError(HttpStatus.BAD_REQUEST, `Cannot admit ${scanQuantity}. Only ${booking.remainingEntries} entries remaining.`);
            }

            // 6. State Updates
            const newRemainingEntries = booking.remainingEntries - scanQuantity;
            const isFirstScan = booking.remainingEntries === booking.quantity;
            
            // Mark as 'ATTENDED' if all tickets are used [cite: 316]
            const newBookingStatus = newRemainingEntries === 0 ? BOOKING_STATUS.ATTENDED : booking.bookingStatus;

            // await this._bookingRepository.updateBookingEntry(booking.bookingId, {
            //     remainingEntries: newRemainingEntries,
            //     bookingStatus: newBookingStatus,
            //     ...(isFirstScan && { checkedInAt: new Date() }) // Stamp first entry time [cite: 316]
            // });

            // Increment event total check-ins [cite: 142, 399]
            // await this._eventRepository.incrementCheckedInCount(event.id.toString(), scanQuantity);

            // 7. Return Result
            return {
                message: `${scanQuantity} people admitted successfully!`,
                remainingEntries: newRemainingEntries,
                totalBookingQuantity: booking.quantity,
                // Securely reveal the Jitsi link ONLY for online events [cite: 191, 192, 436]
                onlineLink: event.format === EVENT_FORMAT.ONLINE ? event.onlineLink : undefined,
            };

        } catch (error: unknown) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw createHttpError(HttpStatus.UNAUTHORIZED, "Invalid QR code signature.");
            }
            throw error;
        }
    }
}

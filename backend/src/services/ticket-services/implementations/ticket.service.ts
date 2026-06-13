// services/ticket-services/implementations/ticket.service.ts

import jwt from "jsonwebtoken";
import { ITicketService } from "../interfaces/ITicketService";;
import { IBookingRepository } from "@/repositories/interfaces/IBookingRepository";
import { IEventRepository } from "@/repositories/interfaces/IEventRepository";
import { QRTokenPayload } from "@/types/ticket.types";



export class TicketService implements ITicketService {
    constructor(
        private readonly _bookingRepository: IBookingRepository,
        private readonly _eventRepository: IEventRepository
    ) {}

    generateQrToken(qRTokenPayload: QRTokenPayload): string {
        // const { bookingId, eventId, userId } = qRTokenPayload;

        const generatedQRString: string = jwt.sign(
            qRTokenPayload,
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

}

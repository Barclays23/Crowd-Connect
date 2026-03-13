// services/ticket-services/implementations/ticket.service.ts

import jwt from "jsonwebtoken";
import { ITicketService } from "../interfaces/ITicketService";


export class TicketService implements ITicketService {

    generateQrToken({ userId, eventId, newBookingQty }: {
        userId:   string;
        eventId:  string;
        newBookingQty: number;
    }): string {
        const generatedQRString = jwt.sign(
            { userId, eventId, newBookingQty },
            process.env.JWT_QRCODE_SECRET!,
            { expiresIn: "90d" }
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
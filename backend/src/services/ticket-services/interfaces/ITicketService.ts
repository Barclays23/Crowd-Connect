// services/ticket-services/interfaces/ITicketService.ts

import { QRTokenPayload } from "@/types/ticket.types";


// not used
export interface ValidateQrRequestDTO {
    qrToken: string;
    scanQuantity: number; // e.g., 3 people entering out of a 5-ticket booking
}


export interface ValidateQrResult {
    message: string;
    remainingEntries: number;
    totalBookingQuantity: number;
    onlineLink?: string; // Optional: Only returned for online events
}

export interface ITicketService {
    generateQrToken(qRTokenPayload: QRTokenPayload): string;
    generateTicketNo(): string;
    validateQrToken(qrToken: string, scanQuantity: number): Promise<ValidateQrResult>;
}
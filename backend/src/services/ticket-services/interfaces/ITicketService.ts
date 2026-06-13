// services/ticket-services/interfaces/ITicketService.ts

import { QRTokenPayload } from "@/types/ticket.types";



export interface ITicketService {
    generateQrToken(qRTokenPayload: QRTokenPayload): string;
    generateTicketNo(): string;
}
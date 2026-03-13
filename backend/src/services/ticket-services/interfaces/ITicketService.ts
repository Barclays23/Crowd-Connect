// services/ticket-services/interfaces/ITicketService.ts

export interface ITicketService {
    generateQrToken(payload: { userId: string; eventId: string; newBookingQty: number }): string;
    generateTicketNo(): string;
}
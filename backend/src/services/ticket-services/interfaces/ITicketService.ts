// services/ticket-services/interfaces/ITicketService.ts


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
    generateQrToken(payload: { userId: string; eventId: string; bookingId: string }): string;
    generateTicketNo(): string;
    validateQrToken(qrToken: string, scanQuantity: number): Promise<ValidateQrResult>;
}
//  backend/src/types/ticket.types.ts


// NOTE: No `exp` field — time window is always checked live from DB
export interface QRTokenPayload {
  bookingId: string;
  eventId:   string;
  userId:    string;
}
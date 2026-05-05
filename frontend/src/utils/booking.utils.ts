import { BOOKING_CONSTRAINTS, cancellableStatuses } from "@/types/booking.types";
import { EVENT_FORMATS, type EVENT_FORMAT } from "@/types/event.types";
import { BOOKING_STATUS } from "@/types/booking.types";




// Simple helper for UI max quantity
export const getMaxBookingQuantity = (
  format: EVENT_FORMAT, 
  ticketsLeft: number
): number => {
  const maxPerBooking = format === EVENT_FORMATS.ONLINE 
    ? BOOKING_CONSTRAINTS.ONLINE.MAX_PER_BOOKING 
    : BOOKING_CONSTRAINTS.OFFLINE.MAX_PER_BOOKING;
  
  return Math.min(maxPerBooking, ticketsLeft);
};






export function canCancelBooking(booking: {
  bookingStatus: BOOKING_STATUS;
  event: { startDateTime: string | Date };
}): boolean {
  const eventDate = new Date(booking.event.startDateTime);
  const now = new Date();

  return cancellableStatuses.has(booking.bookingStatus) && eventDate > now;
}



// Helper to check if user can book more tickets
// export const canUserBookMore = (
//   format: EVENT_FORMAT,
//   userExistingTickets: number,
//   requestedQuantity: number = 0
// ): boolean => {
//   const maxPerUser = format === EVENT_FORMATS.ONLINE 
//     ? BOOKING_CONSTRAINTS.ONLINE.MAX_PER_USER 
//     : BOOKING_CONSTRAINTS.OFFLINE.MAX_PER_USER;
  
//   return (userExistingTickets + requestedQuantity) <= maxPerUser;
// };
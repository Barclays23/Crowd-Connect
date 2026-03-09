// backend/src/repositories/interfaces/IBookingRepository.ts

import { BookingCancelInput, BookingEntity, BookingEntityPopulated, ConfirmBookingInput, CreateBookingInput } from "@/entities/booking.entity";
import { GetBookingsFilter, GetBookingsResult } from "@/types/booking.types";




export interface IBookingRepository {

  createBooking(input: CreateBookingInput): Promise<BookingEntity>;

  getBookingById(bookingId: string): Promise<BookingEntityPopulated | null>;

  getBookingByOrderId(orderId: string): Promise<BookingEntity | null>;

  getBookingByQrToken(token: string): Promise<BookingEntity | null>;

  // Confirm booking after payment verified — sets CONFIRMED status + stores payment + qrToken
  confirmBooking(bookingId: string, input: ConfirmBookingInput): Promise<BookingEntity | null>;

  // Mark as FAILED when Razorpay payment.failed webhook received
  markBookingFailed(bookingId: string): Promise<void>;

  // Get paginated bookings — works for both user dashboard and admin dashboard
  // Pass userId to scope to one user; omit for admin (all users)
  findBookings(filter: GetBookingsFilter): Promise<GetBookingsResult>;

  // Sum of ticket quantity across all CONFIRMED bookings for a user on an event
  sumConfirmedTicketsForUser(userId: string, eventId: string): Promise<number>;

  // Update booking fields — used for cancellation
  // updateBooking(bookingId: string, data: Partial<BookingEntity>): Promise<BookingEntity | null>;

  // Atomically decrement remainingEntries — used during QR scan
  decrementRemainingEntries(bookingId: string, count: number): Promise<BookingEntity | null>;

  cancelBooking(bookingId: string, cancellationInput: BookingCancelInput): Promise<BookingEntity | null>;
}
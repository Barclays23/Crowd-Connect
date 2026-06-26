// backend/src/repositories/interfaces/IBookingRepository.ts

import { 
  CancelBookingInput, 
  BookingEntity, 
  BookingEntityPopulated, 
  BulkCancelBookingsInput, 
  ConfirmBookingInput, 
  CreateBookingInput, 
  MarkRefundedInput 
} from "@/entities/booking.entity";
import {
  GetBookingsFilter, 
  GetBookingsResult, 
  MajorEventChange 
} from "@/types/booking.types";
import { ClientSession } from "mongoose";




export interface IBookingRepository {

  createBooking(input: CreateBookingInput, options?: { session?: ClientSession }): Promise<BookingEntity>;

  getBookingById(bookingId: string): Promise<BookingEntityPopulated | null>;
  getBookingByOrderId(orderId: string): Promise<BookingEntity | null>;
  getBookingByPaymentId(paymentId: string): Promise<BookingEntityPopulated | null>;
  getBookingByQrToken(token: string): Promise<BookingEntity | null>;
  
  // for online retry payment
  updateBookingPaymentOrderId(bookingId: string, newOrderId: string): Promise<void>

  // Confirm booking after payment verified — sets CONFIRMED status + stores payment + qrToken
  confirmOnlineBooking(bookingId: string, input: ConfirmBookingInput, options?: { session?: ClientSession }): Promise<BookingEntity | null>;

  // Confirm a pending booking via Wallet Retry
  confirmWalletRetryBooking(bookingId: string, qrToken: string, walletOrderId: string, options?: { session?: ClientSession }): Promise<BookingEntity | null>;

  // do this with cron job or bullMQ (see bottom)
  markBookingFailed(bookingId: string): Promise<void>;

  markBookingPaymentFailed(bookingId: string): Promise<void>;

  markBookingAsRefunded(
    bookingId: string, 
    refundDetails: MarkRefundedInput, 
    options?: { session?: ClientSession }
  ): Promise<BookingEntity | null>;

  // Get paginated bookings — works for both user dashboard and admin dashboard
  // Pass userId to scope to one user; omit for admin (all users)
  findBookings(filter: GetBookingsFilter): Promise<GetBookingsResult>;

  // Sum of ticket quantity across all CONFIRMED bookings for a user on an event
  sumConfirmedTicketsForUser(userId: string, eventId: string): Promise<number>;

  // Update booking fields — used for cancellation
  // updateBooking(bookingId: string, data: Partial<BookingEntity>): Promise<BookingEntity | null>;


  cancelBooking(
    bookingId: string, 
    cancellationInput: CancelBookingInput, 
    options?: { session?: ClientSession }
  ): Promise<BookingEntity | null>;

  
  setGracePeriodForEvent(eventId: string, data: { gracePeriodEnd: Date; majorEventChange: MajorEventChange }): Promise<void>;
  
  findConfirmedBookingsForEvent(eventId: string): Promise<BookingEntityPopulated[]>;
  findPendingBookingsForEvent(eventId: string):   Promise<BookingEntityPopulated[]>;
  bulkCancelBookings(bookingIds: string[], updateInput: BulkCancelBookingsInput): Promise<void>;
  
  startSession(): Promise<ClientSession>;
}
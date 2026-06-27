// backend/src/services/booking-services/interfaces/IBookingService.ts

import { PaymentMethod } from "@/constants/payment.constants";
import { UserRole } from "@/constants/user-system.constants";
import {
  BookingResponseDTO,
  BookingOrderRequestDTO,
  GetBookingsResponseDTO,
  InitiateBookingResponseDTO,
  VerifyPaymentRequestDTO,
  BookingOrderResponseDTO,
} from "@/dtos/booking.dto";
import { GetBookingsFilter } from "@/types/booking.types";
import { DetectedChange } from "@/utils/event-change-detector";




export interface IBookingService {

  initiateBooking(bookingReqDto: BookingOrderRequestDTO): Promise<InitiateBookingResponseDTO>;

  retryPayment(bookingId: string, userId: string, paymentMethod: PaymentMethod): Promise<InitiateBookingResponseDTO>

  // called by both webhook strategy and booking controller (for online payment & booking confirmation)
  verifyPaymentAndConfirmBooking(userId: string, dto: VerifyPaymentRequestDTO, skipSignatureCheck?: boolean): Promise<BookingResponseDTO>;

  getMyBookings(userId: string, filters: GetBookingsFilter): Promise<GetBookingsResponseDTO>;

  // getAdminBookings(filters: GetBookingsFilter): Promise<GetBookingsResponseDTO>;
  // getAllBookingsOfEvent(filters: GetBookingsFilter): Promise<GetBookingsResponseDTO>;
  // for both admin side bookings-list & event-bookings/event-attendees list
  getBookingsList(filters: GetBookingsFilter): Promise<GetBookingsResponseDTO>;

  getBookingById(bookingId: string, requestingUserId: string, role: UserRole): Promise<BookingResponseDTO>;

  cancelBookingByUser(bookingId: string, userId: string, cancelReason: string): Promise<void>;

  cancelBookingByAuthority(bookingId: string, cancelReason: string): Promise<void>;
  
  cancelAllBookingsForEvent(eventId: string, cancelReason: string): Promise<void>;

  setGracePeriodForEvent(eventId: string, data: { gracePeriodEnd: Date; summary: string, changes: DetectedChange[]; }): Promise<void>;

}
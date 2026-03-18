// backend/src/services/booking-services/interfaces/IBookingService.ts

import {
  BookingResponseDTO,
  BookingOrderRequestDTO,
  GetBookingsResponseDTO,
  InitiateBookingResponseDTO,
  VerifyPaymentRequestDTO,
} from "@/dtos/booking.dto";
import { BookingEntityPopulated } from "@/entities/booking.entity";
import { BOOKING_STATUS, GetBookingsFilter } from "@/types/booking.types";
import { DetectedChange } from "@/utils/event-change-detector";
import { RefundContext } from "@/utils/refundCalculator";




export interface IBookingService {

  initiateBooking(bookingReqDto: BookingOrderRequestDTO): Promise<InitiateBookingResponseDTO>;

  // can I use this same for booking payment and host role upgrade payment? or need separate?
  verifyAndConfirmPayment(userId: string, dto: VerifyPaymentRequestDTO): Promise<BookingResponseDTO>;

  getMyBookings(userId: string, filters: GetBookingsFilter): Promise<GetBookingsResponseDTO>;

  getAdminBookings(filters: GetBookingsFilter): Promise<GetBookingsResponseDTO>;

  getBookingById(bookingId: string, requestingUserId: string, role: "user" | "host" | "admin"): Promise<BookingResponseDTO>;

  cancelBookingByUser(bookingId: string, userId: string, cancelReason: string): Promise<void>;

  cancelBookingByAuthority(bookingId: string, cancelReason: string): Promise<void>;

  cancelAllBookingsForEvent(eventId: string, cancelReason: string): Promise<void>;

  setGracePeriodForEvent(eventId: string, data: { gracePeriodEnd: Date; summary: string, changes: DetectedChange[]; }): Promise<void>;

}
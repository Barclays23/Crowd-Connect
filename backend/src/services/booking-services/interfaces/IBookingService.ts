// backend/src/services/booking-services/interfaces/IBookingService.ts

import {
  BookingResponseDTO,
  BookingOrderRequestDTO,
  GetBookingsResponseDTO,
  InitiateBookingResponseDTO,
  VerifyPaymentRequestDTO,
} from "@/dtos/booking.dto";
import { BOOKING_STATUS, GetBookingsFilter } from "@/types/booking.types";




export interface IBookingService {

  initiateBooking(bookingReqDto: BookingOrderRequestDTO): Promise<InitiateBookingResponseDTO>;

  getMyBookings(userId: string, filters: GetBookingsFilter): Promise<GetBookingsResponseDTO>;

  getAdminBookings(filters: GetBookingsFilter): Promise<GetBookingsResponseDTO>;

  getBookingById(bookingId: string, requestingUserId: string, role: "user" | "host" | "admin"): Promise<BookingResponseDTO>;

  cancelBookingByUser(bookingId: string, userId: string, cancelReason: string): Promise<void>;

}
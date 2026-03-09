// backend/src/services/booking-services/implementations/booking.service.ts

import jwt from "jsonwebtoken";
import Razorpay from "razorpay";

import { IBookingService }    from "@/services/booking-services/interfaces/IBookingService";
import { IBookingRepository } from "@/repositories/interfaces/IBookingRepository";
import { IEventRepository }   from "@/repositories/interfaces/IEventRepository";

import {
   BookingOrderRequestDTO,
   BookingOrderResponseDTO,
   BookingResponseDTO,
   GetBookingsResponseDTO,
   InitiateBookingResponseDTO,
   VerifyPaymentRequestDTO,
} from "@/dtos/booking.dto";
import { mapBookingEntityToResponseDTO, mapBookingOrderDtoToInput } from "@/mappers/booking.mapper";

import { BOOKING_STATUS, GetBookingsFilter, GetBookingsResult, PAYMENT_STATUS } from "@/types/booking.types";
import { EVENT_FORMAT, EVENT_STATUS, TICKET_TYPE } from "@/types/event.types";
import { HttpStatus } from "@/constants/statusCodes.constants";
import { createHttpError } from "@/utils/httpError.utils";
import { HttpResponse } from "@/constants/responseMessages.constants";
import { BOOKING_MESSAGES, MIN_TICKETS_PER_BOOKING, OFFLINE_MAX_TICKETS_PER_BOOKING, OFFLINE_MAX_TICKETS_PER_USER, ONLINE_MAX_TICKETS_PER_USER } from "@/constants/booking.constants";
import { BookingCancelInput, BookingEntity, BookingEntityPopulated, CreateBookingInput } from "@/entities/booking.entity";
import { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import { ABOVE_H48_REFUND_PERCENT, ADMIN_COMMISSION_PERCENT, BELOW_H24_REFUND_PERCENT, BELOW_H48_REFUND_PERCENT, GRACE_PERIOD_REFUND_PERCENT, NO_REFUND_PERCENT } from "@/types/payment.types";
import { IPaymentService } from "@/services/payment-services/interfaces/IPaymentService";
import { RefundResult } from "@/services/payment-services/interfaces/IPaymentProvider";



export class BookingService implements IBookingService {

   constructor(
      private readonly _bookingRepository: IBookingRepository,
      private readonly _eventRepository:  IEventRepository,
      private readonly _userRepository:  IUserRepository,
      private readonly _paymentService:  IPaymentService,
   ) {}


   async initiateBooking(
      bookingReqDto: BookingOrderRequestDTO
   ): Promise<InitiateBookingResponseDTO> {
      try {
         const { eventId, userId, quantity: newBookingQty } = bookingReqDto;

         const user = await this._userRepository.getUserById(userId);
         if (!user) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
         }

         if (user.isSuperAdmin) {
            throw createHttpError(HttpStatus.FORBIDDEN, BOOKING_MESSAGES.SUPER_ADMIN_CANNOT_BOOK);
         }

         const event = await this._eventRepository.getEventById(eventId);
         if (!event) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.EVENT_NOT_FOUND);
         }
         if (event.organizer.hostId.toString() === userId) {
            throw createHttpError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.CANNOT_BOOK_OWN_EVENT);
         }

         if (event.eventStatus === EVENT_STATUS.CANCELLED) {
            throw createHttpError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.EVENT_ALREADY_CANCELLED);
         }
         if (event.eventStatus === EVENT_STATUS.SUSPENDED) {
            throw createHttpError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.EVENT_ALREADY_SUSPENDED);
         }
         if (event.eventStatus === EVENT_STATUS.COMPLETED || event.endDateTime < new Date()) {
            throw createHttpError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.EVENT_ALREADY_ENDED);
         }

         if (event.eventStatus === EVENT_STATUS.DRAFT) {
            throw createHttpError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.EVENT_NOT_BOOKABLE);
         }

         const ticketsLeft = event.capacity - event.soldTickets;
         if (ticketsLeft <= 0) {
            throw createHttpError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.TICKETS_SOLD_OUT);
         }

         const existingTicketCount = await this._bookingRepository.sumConfirmedTicketsForUser(userId, eventId);

         if (event.format === EVENT_FORMAT.ONLINE) {
            if (newBookingQty !== ONLINE_MAX_TICKETS_PER_USER) {
               throw createHttpError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.ONLINE_LIMIT_PER_USER);
            }

            if (existingTicketCount >= ONLINE_MAX_TICKETS_PER_USER) {
               throw createHttpError(HttpStatus.CONFLICT, BOOKING_MESSAGES.ONLINE_LIMIT_EXCEEDED);
            }

         } else {
            if (newBookingQty < MIN_TICKETS_PER_BOOKING) {
               throw createHttpError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.MIN_TICKETS_REQUIRED);
            }
            if (newBookingQty > OFFLINE_MAX_TICKETS_PER_BOOKING) {
               throw createHttpError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.PER_BOOKING_LIMIT_EXCEEDED);
            }

            if (existingTicketCount + newBookingQty > OFFLINE_MAX_TICKETS_PER_USER) {
               throw createHttpError(
                  HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.PER_USER_LIMIT_EXCEEDED(existingTicketCount + newBookingQty)
               );
            }
         }

         if (newBookingQty > ticketsLeft) {
            throw createHttpError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.NOT_ENOUGH_TICKETS(ticketsLeft));
         }

         const totalAmount: number = event.ticketPrice * newBookingQty; // ₹0 for free events
         const ticketNo: string =  this._generateTicketNo();
         const eventFormat: EVENT_FORMAT = event.format;
         
         // if (event.ticketType === TICKET_TYPE.FREE) {
            const qrToken = this._generateQrToken({ userId, eventId, newBookingQty });

            // const freeBookingInput = mapFreeBookingOrderDtoToInput(...);
            // const paidBookingInput = mapPaidBookingOrderDtoToInput(...);
            const createBookingInput: CreateBookingInput = mapBookingOrderDtoToInput(
               userId,
               event,
               newBookingQty,
               ticketNo,
               eventFormat,
               qrToken,
               `free_${userId}_${Date.now()}`,
               PAYMENT_STATUS.PAID,
               BOOKING_STATUS.CONFIRMED
            )

            const bookingEntity: BookingEntity = await this._bookingRepository.createBooking(createBookingInput);

            await this._eventRepository.incrementEventTicketStats(eventId, newBookingQty, totalAmount);

            const populated = await this._bookingRepository.getBookingById(bookingEntity.bookingId);
            if (!populated) {
               throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, BOOKING_MESSAGES.BOOKING_NOT_FOUND);
            }

            const populatedBooking: BookingResponseDTO = mapBookingEntityToResponseDTO(populated);

            return {
               isFree: true,
               populatedBooking
            };
         // }

         // ── PAID EVENT ──────────────────────────────────────────────────────────


      } catch (error: unknown) {
         const msg = error instanceof Error ? error.message : "Unknown error";
         console.error("Error in BookingService.initiateBooking:", msg);
         throw error;
      }
   }


   async getMyBookings(
      userId:  string,
      filters: GetBookingsFilter
   ): Promise<GetBookingsResponseDTO> {
      try {
         console.log("filters in BookingService.getMyBookings:", filters);

         const result = await this._bookingRepository.findBookings({ ...filters, userId });

         return {
            bookings:   result.bookings.map(mapBookingEntityToResponseDTO),
            pagination: result.pagination,
         };

      } catch (error: unknown) {
         const msg = error instanceof Error ? error.message : "Unknown error";
         console.error("Error in BookingService.getMyBookings:", msg);
         throw error;
      }
   }


   async getAdminBookings(filters: GetBookingsFilter): Promise<GetBookingsResponseDTO> {
      try {
         console.log("filters in BookingService.getAdminBookings:", filters);

         const result: GetBookingsResult = await this._bookingRepository.findBookings(filters);

         return {
            bookings:   result.bookings.map(mapBookingEntityToResponseDTO),
            pagination: result.pagination,
         };

      } catch (error: unknown) {
         const msg = error instanceof Error ? error.message : "Unknown error";
         console.error("Error in BookingService.getAdminBookings:", msg);
         throw error;
      }
   }


   async getBookingById(
      bookingId:        string,
      requestingUserId: string,
      role:             "user" | "host" | "admin"
   ): Promise<BookingResponseDTO> {
      try {
         const booking = await this._bookingRepository.getBookingById(bookingId);
         if (!booking) {
            throw createHttpError(HttpStatus.NOT_FOUND, "Booking not found");
         }
         if (role !== "admin" && booking.user.userId !== requestingUserId) {
            throw createHttpError(HttpStatus.FORBIDDEN, "You are not authorised to view this booking");
         }

         return mapBookingEntityToResponseDTO(booking);

      } catch (error: unknown) {
         const msg = error instanceof Error ? error.message : "Unknown error";
         console.error("Error in BookingService.getBookingById:", msg);
         throw error;
      }
   }


   async cancelBookingByUser(bookingId: string, userId: string, cancelReason: string): Promise<void> {
      try {
         const booking: BookingEntityPopulated | null = await this._bookingRepository.getBookingById(bookingId);
         if (!booking) {
            throw createHttpError(HttpStatus.NOT_FOUND, BOOKING_MESSAGES.BOOKING_NOT_FOUND);
         }
         if (booking.user.userId !== userId) {
            throw createHttpError(HttpStatus.FORBIDDEN, BOOKING_MESSAGES.UNAUTHORIZED_BOOKING_CANCELLATION);
         }
         if (booking.bookingStatus === BOOKING_STATUS.CANCELLED) {
            throw createHttpError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.BOOKING_ALREADY_CANCELLED);
         }
         if (booking.bookingStatus === BOOKING_STATUS.FAILED || 
            booking.bookingStatus === BOOKING_STATUS.PENDING ||
            booking.bookingStatus === BOOKING_STATUS.ATTENDED
         ) {
            throw createHttpError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.CANCELLATION_NOT_ALLOWED);
         }
         if (booking.event.startDateTime <= new Date()) {
            throw createHttpError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.CANCELLATION_WINDOW_CLOSED);
         }

         // QR scanning opens 30 min before startDateTime — entries may already
         // be consumed before the event-started guard above triggers.
         if (booking.remainingEntries === 0 || booking.quantity !== booking.remainingEntries) {
            throw createHttpError(HttpStatus.BAD_REQUEST, BOOKING_MESSAGES.CANNOT_CANCEL_AFTER_ENTRY);
         }

         // ── Refund Calculation ────────────────────────────────────────
         const isFree = booking.ticketRate === 0;
         let refundAmount = 0;

         if (!isFree) {
            let refundPercentage = NO_REFUND_PERCENT;
            const isGraceRefundActive = !!booking.refundGracePeriodEnd && new Date() <= booking.refundGracePeriodEnd;

            if (isGraceRefundActive) {
               refundPercentage = GRACE_PERIOD_REFUND_PERCENT;
            } else {
               const hoursToStart =
                  (new Date(booking.event.startDateTime).getTime() - Date.now()) / (1000 * 60 * 60);

               if (hoursToStart >= 48)                           refundPercentage = ABOVE_H48_REFUND_PERCENT;
               else if (hoursToStart < 48 && hoursToStart >= 24) refundPercentage = BELOW_H48_REFUND_PERCENT;
               else if (hoursToStart < 24 && hoursToStart > 0)   refundPercentage = BELOW_H24_REFUND_PERCENT;
               else                                              refundPercentage = NO_REFUND_PERCENT;
            }

            refundAmount = Math.round(
               booking.totalAmount * (1 - ADMIN_COMMISSION_PERCENT / 100) * (refundPercentage / 100)
            );
         }

         let refundId: string | undefined;

         if (refundAmount > 0) {
            if (!booking.payment.paymentId) {
               throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, "Payment ID missing — cannot initiate refund");
            }
            const refund: RefundResult = await this._paymentService.initiateBookingRefund({
               paymentId: booking.payment.paymentId,
               bookingId,
               amount: refundAmount * 100, // paise
            });
            refundId = refund.refundId;
         }

         // ── Cancel Booking ────────────────────────────────────────────
         const cancellationInput: BookingCancelInput = {
            bookingStatus:  BOOKING_STATUS.CANCELLED,
            paymentStatus:  refundAmount > 0 ? PAYMENT_STATUS.REFUNDED : PAYMENT_STATUS.PAID,
            cancellation: {
               cancelledAt: new Date(),
               reason: cancelReason,
               ...(refundId && { refundId: refundId }),
            },
            // qrToken: "",  // should clear QR token ??
         };

         await this._bookingRepository.cancelBooking(bookingId, cancellationInput);

         // ── Update Event Ticket Stats ───────────────────────────────────────
         await this._eventRepository.decrementEventTicketStats(
            booking.event.eventId,
            booking.quantity,
            booking.totalAmount,
         );


      } catch (error: unknown) {
         const msg = error instanceof Error ? error.message : "Unknown error";
         console.error("Error in BookingService.cancelBookingByUser:", msg);
         throw error;
      }
   }



   private _generateQrToken({
      userId,
      eventId,
      newBookingQty,
   }: {
      userId:   string;
      eventId:  string;
      newBookingQty: number;
   }): string {
      
      const generatedQRString = jwt.sign(
         { userId, eventId, newBookingQty },
         process.env.JWT_QRCODE_SECRET!,
         { expiresIn: "90d" }
      );
      console.log('generatedQRString:', generatedQRString)
      return generatedQRString;
   }

   private _generateTicketNo(): string {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const random = Array.from({ length: 8 }, () =>
         chars[Math.floor(Math.random() * chars.length)]
      ).join("");
      
      return `CC-${random}`;   // e.g. CC-X7KP2QAM
   }
}
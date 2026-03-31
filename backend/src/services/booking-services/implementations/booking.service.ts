// backend/src/services/booking-services/implementations/booking.service.ts
import { IBookingService }    from "@/services/booking-services/interfaces/IBookingService";
import { IBookingRepository } from "@/repositories/interfaces/IBookingRepository";
import { IEventRepository }   from "@/repositories/interfaces/IEventRepository";

import {
   BookingOrderRequestDTO,
   BookingResponseDTO,
   GetBookingsResponseDTO,
   InitiateBookingResponseDTO,
   VerifyPaymentRequestDTO,
} from "@/dtos/booking.dto";
import { 
   mapBookingEntityToResponseDTO, 
   mapBookingOrderDtoToInput, 
   mapConfirmBookingInput 
} from "@/mappers/booking.mapper";

import { 
   BOOKING_STATUS, 
   GetBookingsFilter, 
   GetBookingsResult, 
   PAYMENT_STATUS 
} from "@/types/booking.types";
import { TICKET_TYPE } from "@/types/event.types";
import { HttpStatus } from "@/constants/statusCodes.constants";
import { createHttpError } from "@/utils/httpError.utils";
import { 
   BookingCancelInput, 
   BookingEntity, 
   BookingEntityPopulated, 
   ConfirmBookingInput, 
   CreateBookingInput 
} from "@/entities/booking.entity";
import { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import { IPaymentService } from "@/services/payment-services/interfaces/IPaymentService";
import { ITicketService } from "@/services/ticket-services/interfaces/ITicketService";
import { 
   validateBookingCancelByAuthority, 
   validateBookingCancelByUser, 
   validateInitiateBooking, 
   validateVerifyAndConfirmPayment
} from "@/utils/validations/bookingValidations";
import { calculateRefundAmount, RefundContext } from "@/utils/refundCalculator";
import { UserEntity } from "@/entities/user.entity";
import { EventEntity } from "@/entities/event.entity";
import { DetectedChange } from "@/utils/event-change-detector";
import { Types } from "mongoose";
import { UserRole } from "@/constants/roles-and-statuses";
import { redisClient } from "@/config/redis.config";
import { IWalletService } from "@/services/wallet-services/interfaces/IWalletService";
import { TRANSACTION_REFERENCE_TYPE, TRANSACTION_TYPE } from "@/types/wallet.types";
import { BookingMessages } from "@/constants/responseMessages.constants";



export class BookingService implements IBookingService {

   constructor(
      private readonly _bookingRepository: IBookingRepository,
      private readonly _eventRepository:  IEventRepository,
      private readonly _userRepository:  IUserRepository,
      private readonly _paymentService:  IPaymentService,
      private readonly _ticketService:  ITicketService,
      private readonly _walletService : IWalletService,
   ) {}


   async initiateBooking(
      bookingReqDto: BookingOrderRequestDTO
   ): Promise<InitiateBookingResponseDTO> {
      try {
         const { eventId, userId, quantity: newBookingQty } = bookingReqDto;

         const user: UserEntity | null = await this._userRepository.getUserById(userId);

         const event: EventEntity | null = await this._eventRepository.getEventById(eventId);

         const existingTicketCount = await this._bookingRepository.sumConfirmedTicketsForUser(userId, eventId);

         const ticketsLeft = event ? (event.capacity - event.soldTickets) : 0;

         validateInitiateBooking(user, event, bookingReqDto, existingTicketCount, ticketsLeft);
         // const { user: validUser, event: validEvent } = validateInitiateBooking(user, event, bookingReqDto, existingTicketCount, ticketsLeft);

         const totalAmount: number = event.ticketPrice * newBookingQty; // ₹0 for free events
         const ticketNo: string =  this._ticketService.generateTicketNo();
         console.log('ticketNo :', ticketNo)

         // ── FREE EVENT ──────────────────────────────────────────────────────────
         if (event.ticketType === TICKET_TYPE.FREE) {
            const newBookingId = new Types.ObjectId().toHexString();   // Pre-generate the Booking ID so the QR token and DB record match perfectly

            const qrToken = this._ticketService.generateQrToken({ userId, eventId, bookingId: newBookingId });

            // const freeBookingInput = mapFreeBookingOrderDtoToInput(...);
            // const paidBookingInput = mapPaidBookingOrderDtoToInput(...);
            const createBookingInput: CreateBookingInput = mapBookingOrderDtoToInput({
               userId,
               event,
               newBookingQty,
               ticketNo,
               qrToken,
            })

            const bookingEntity: BookingEntity = await this._bookingRepository.createBooking({
               _id: newBookingId,
               ...createBookingInput,
            });

            await this._eventRepository.incrementEventTicketStats(eventId, newBookingQty, totalAmount);
            
            await redisClient.del("trending_events");

            const populated = await this._bookingRepository.getBookingById(bookingEntity.bookingId);
            if (!populated) {
               throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, BookingMessages.BOOKING_NOT_FOUND);
            }

            const populatedBooking: BookingResponseDTO = mapBookingEntityToResponseDTO(populated);

            return {
               isFree: true,
               populatedBooking
            };
         }

         // ── PAID EVENT ──────────────────────────────────────────────────────────
         const paymentOrder = await this._paymentService.createBookingOrder(totalAmount, userId);

         const createBookingInput: CreateBookingInput = mapBookingOrderDtoToInput({
            userId,
            event,
            newBookingQty,
            ticketNo,
            paymentOrderId: paymentOrder.orderId,
         });

         const pendingBooking: BookingEntity = await this._bookingRepository.createBooking(createBookingInput);
         console.log('pendingBooking :', pendingBooking )

         return {
            isFree: false,
            order: {
               bookingId: pendingBooking.bookingId,
               orderId: paymentOrder.orderId,
               amount: paymentOrder.amount,
               currency: paymentOrder.currency,
               keyId: process.env.RAZORPAY_KEY_ID!,
            },
         };


      } catch (error: unknown) {
         const msg = error instanceof Error ? error.message : "Unknown error";
         console.error("Error in BookingService.initiateBooking:", msg);
         throw error;
      }
   }



   async verifyAndConfirmPayment(userId: string, dto: VerifyPaymentRequestDTO): Promise<BookingResponseDTO> {
      try {
         const { paymentOrderId, paymentId, signature } = dto;

         const booking: BookingEntity | null = await this._bookingRepository.getBookingByOrderId(paymentOrderId);

         validateVerifyAndConfirmPayment(booking, userId);

         const isValidSignature = this._paymentService.verifyPaymentSignature(paymentOrderId, paymentId, signature);

         if (!isValidSignature) {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Payment verification failed — invalid signature");
         }

         const qrToken = this._ticketService.generateQrToken({
            userId,
            eventId: booking.eventRef.toString(),
            bookingId: booking.bookingId.toString(), 
         });

         const confirmBookingInput: ConfirmBookingInput = mapConfirmBookingInput(paymentId, signature, qrToken);

         await this._bookingRepository.confirmBooking(booking.bookingId, confirmBookingInput);

         await this._eventRepository.incrementEventTicketStats(
            booking.eventRef.toString(),
            booking.quantity,
            booking.totalAmount
         );

         await redisClient.del("trending_events");

         const confirmedBooking: BookingEntityPopulated | null = await this._bookingRepository.getBookingById(booking.bookingId);
         if (!confirmedBooking) {
            throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, "Could not retrieve confirmed booking");
         }

         return mapBookingEntityToResponseDTO(confirmedBooking);

      } catch (error: unknown) {
         const msg = error instanceof Error ? error.message : "Unknown error";
         console.error("Error in BookingService.verifyAndConfirmPayment:", msg);
         throw error;
      }
   }



   async getMyBookings(
      userId:  string,
      filters: GetBookingsFilter
   ): Promise<GetBookingsResponseDTO> {
      try {
         console.log("filters in BookingService.getMyBookings:", filters);

         const result: GetBookingsResult = await this._bookingRepository.findBookings({ ...filters, userId });

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
      role:             UserRole
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
         const context: RefundContext = 'user';

         validateBookingCancelByUser(booking, userId);

         await this._processRefundAndCancel(booking!, cancelReason, context);

      } catch (error: unknown) {
         const msg = error instanceof Error ? error.message : "Unknown error";
         console.error("Error in BookingService.cancelBookingByUser:", msg);
         throw error;
      }
   }

   // cancel booking by the authority (admin/ host)
   async cancelBookingByAuthority(bookingId: string, cancelReason: string): Promise<void> {
      try {
         const booking: BookingEntityPopulated | null = await this._bookingRepository.getBookingById(bookingId);
         const context: RefundContext = 'authority';

         validateBookingCancelByAuthority(booking);

         await this._processRefundAndCancel(booking, `Admin Cancellation: ${cancelReason}`, context);

      } catch (error: unknown) {
         const msg = error instanceof Error ? error.message : "Unknown error";
         console.error("Error in BookingService.cancelBookingByAdmin:", msg);
         throw error;
      }
   }



   async cancelAllBookingsForEvent(eventId: string, cancelReason: string): Promise<void> {
      try {
         const [confirmedBookings, pendingBookings] = await Promise.all([
            this._bookingRepository.findConfirmedBookingsForEvent(eventId), // confirmed + attended ?? (not cancelled, failed)
            this._bookingRepository.findPendingBookingsForEvent(eventId),
         ]);

         // Confirmed Bookins — refund + cancel
         const refundResults = await Promise.allSettled(
            confirmedBookings.map(booking => this._processRefundAndCancel(booking, cancelReason, "event_cancelled"))
         );

         refundResults.forEach((result: PromiseSettledResult<void>, i: number) => {
            if (result.status === "rejected") {
               console.error(`Failed to cancel booking ${confirmedBookings[i].bookingId}:`, result.reason);
            }
         });

         // Pending Bookings — no payment yet, just mark cancelled
         if (pendingBookings.length > 0) {
            await this._bookingRepository.bulkCancelBookings(
               pendingBookings.map(booking => booking.bookingId),
               { 
                  bookingStatus: BOOKING_STATUS.CANCELLED, 
                  cancellation: { cancelledAt: new Date(), cancelReason } 
               }
            );
         }

      } catch (error: unknown) {
         const msg = error instanceof Error ? error.message : "Unknown error";
         console.error("Error in BookingService.cancelAllBookingsForEvent:", msg);
         throw error;
      }
   }


   async setGracePeriodForEvent(
      eventId: string,
      data: { gracePeriodEnd: Date; summary: string; changes: DetectedChange[] }
   ): Promise<void> {
      const changeType = data.changes.length === 1
         ? data.changes[0].field    // "STARTDATETIME" | "VENUE" etc.
         : "MULTIPLE";

      await this._bookingRepository.setGracePeriodForEvent(eventId, {
         gracePeriodEnd: data.gracePeriodEnd,
         majorEventChange: {
            changedAt:  new Date(),
            changeType: changeType,
            summary:    data.summary,
         },
      });
   }



   private async _processRefundAndCancel(
      booking:  BookingEntityPopulated,
      cancelReason:   string,
      context:  RefundContext,
   ): Promise<void> {
      const refundAmount: number = calculateRefundAmount(booking, context);
      let refundId: string | undefined;

      // ── Refund Process ────────────────────────────────────────────
      if (refundAmount > 0) {
         if (!booking.payment.paymentId) {
            throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, "Payment ID missing — cannot initiate refund");
         }
         
         const refund = await this._paymentService.initiateBookingRefund({
            paymentId: booking.payment.paymentId,
            bookingId: booking.bookingId,
            amount:    refundAmount
         });
         refundId = refund.refundId;

         // ── Credit Refund Amount to User Wallet ────────────────────────────────────────────
         await this._walletService.creditToWallet({
            userId            : booking.user.userId,
            amount            : refundAmount,
            transactionType   : TRANSACTION_TYPE.BOOKING_REFUND,
            referenceType     : TRANSACTION_REFERENCE_TYPE.BOOKING,
            referenceId       : booking.bookingId,
            description       : `Refund for booking at ${booking.event.title}`,
            metadata          : { razorpayRefundId: refundId },   // attach so you can reconcile later
         });
      }

      // ── Cancel Booking ────────────────────────────────────────────
      const cancellationInput: BookingCancelInput = {
         bookingStatus:  BOOKING_STATUS.CANCELLED,
         paymentStatus:  refundAmount > 0 ? PAYMENT_STATUS.REFUNDED : PAYMENT_STATUS.COMPLETED,
         cancellation: {
            cancelledAt: new Date(),
            reason: cancelReason,
            ...(refundId && { refundId: refundId }),
         },
         // qrToken: "",  // should clear QR token ??
      };

      await this._bookingRepository.cancelBooking(booking.bookingId, cancellationInput);

      
      // ── Update Event Ticket Stats ───────────────────────────────────────
      await this._eventRepository.decrementEventTicketStats(
         booking.event.eventId,
         booking.quantity,
         booking.totalAmount,
      );
   }


}
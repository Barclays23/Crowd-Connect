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
   CancelBookingInput, 
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
import { ClientSession, Types } from "mongoose";
import { UserRole } from "@/constants/roles-and-statuses";
import { IWalletService } from "@/services/wallet-services/interfaces/IWalletService";
import { TRANSACTION_REFERENCE_TYPE, TRANSACTION_TYPE } from "@/types/wallet.types";
import { BookingMessages } from "@/constants/responseMessages.constants";
import { ICacheService } from "@/services/cache-services/interfaces/ICacheService";
import { executeWithTransactionRetry } from "@/utils/transaction.utils";
import { RefundResult } from "@/types/payment.types";
import { IPlatformSettingsService } from "@/services/platform-settings-services/interfaces/IPlatformSettingsService";
import { PlatformSettingsEntity } from "@/entities/platformSettings.entity";
import { QRTokenPayload } from "@/types/ticket.types";
// import { IPlatformSettings } from "@/models/implementations/platformSettings.model";





export class BookingService implements IBookingService {

   constructor(
      private readonly _bookingRepository: IBookingRepository,
      private readonly _eventRepository:  IEventRepository,
      private readonly _userRepository:  IUserRepository,
      private readonly _paymentService:  IPaymentService,
      private readonly _ticketService:  ITicketService,
      private readonly _walletService : IWalletService,
      private readonly _cacheService: ICacheService,
      private readonly _settingsService: IPlatformSettingsService,
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
            const newBookingId: string = new Types.ObjectId().toHexString();   // Pre-generate the Booking ID so the QR token and DB record match perfectly

            const qRTokenPayload: QRTokenPayload = { userId, eventId, bookingId: newBookingId }

            const qrToken: string = this._ticketService.generateQrToken(qRTokenPayload);

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

            await this._eventRepository.incrementEventTicketAndRevenueStats(eventId, newBookingQty, totalAmount);
            
            // await redisClient.del("trending_events");
            await this._cacheService.deleteKeyValue("trending_events");

            const [populated, settings] = await Promise.all([
               this._bookingRepository.getBookingById(bookingEntity.bookingId),
               this._settingsService.getPlatformSettings(),
            ]);

            if (!populated) {
               throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, BookingMessages.BOOKING_NOT_FOUND);
            }

            const populatedBooking: BookingResponseDTO = mapBookingEntityToResponseDTO(populated, settings);

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



   async verifyAndConfirmBookingPayment(userId: string, dto: VerifyPaymentRequestDTO): Promise<BookingResponseDTO> {
      try {
         const { paymentOrderId, paymentId, signature } = dto;

         const booking: BookingEntity | null = await this._bookingRepository.getBookingByOrderId(paymentOrderId);

         validateVerifyAndConfirmPayment(booking, userId);

         const isValidSignature = this._paymentService.verifyPaymentSignature(paymentOrderId, paymentId, signature);

         if (!isValidSignature) {
            throw createHttpError(HttpStatus.BAD_REQUEST, "Payment verification failed — invalid signature");
         }

         return await this._processPaymentConfirmationAndBooking(booking!, userId, paymentId, signature);

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

         const [result, settings]: [GetBookingsResult, PlatformSettingsEntity] = await Promise.all([
            this._bookingRepository.findBookings({ ...filters, userId }),
            this._settingsService.getPlatformSettings(),
         ]);

         return {
            bookings:   result.bookings.map(bkg => mapBookingEntityToResponseDTO(bkg, settings)),
            pagination: result.pagination,
         };

      } catch (error: unknown) {
         const msg = error instanceof Error ? error.message : "Unknown error";
         console.error("Error in BookingService.getMyBookings:", msg);
         throw error;
      }
   }



   // instead of getAdminBookings & getAllBookingsOfEvent
   // for both admin side bookings & event-bookings/attendees list
   async getBookingsList(filters: GetBookingsFilter): Promise<GetBookingsResponseDTO> {
      try {
         console.log("filters in BookingService.getBookingsList:", filters);

         const [result, settings]: [GetBookingsResult, PlatformSettingsEntity] = await Promise.all([
            this._bookingRepository.findBookings(filters),
            this._settingsService.getPlatformSettings(),
         ]);

         return {
            bookings:   result.bookings.map(bkg => mapBookingEntityToResponseDTO(bkg, settings)),
            pagination: result.pagination,
         };

      } catch (error: unknown) {
         const msg = error instanceof Error ? error.message : "Unknown error";
         console.error("Error in BookingService.getBookingsList:", msg);
         throw error;
      }
   }


   
   // // not needed
   // async getAdminBookings(filters: GetBookingsFilter): Promise<GetBookingsResponseDTO> {
   //    try {
   //       console.log("filters in BookingService.getAdminBookings:", filters);

   //       const result: GetBookingsResult = await this._bookingRepository.findBookings(filters);

   //       return {
   //          bookings:   result.bookings.map(mapBookingEntityToResponseDTO),
   //          pagination: result.pagination,
   //       };

   //    } catch (error: unknown) {
   //       const msg = error instanceof Error ? error.message : "Unknown error";
   //       console.error("Error in BookingService.getAdminBookings:", msg);
   //       throw error;
   //    }
   // }


   // // not needed
   // async getAllBookingsOfEvent(filters: GetBookingsFilter): Promise<GetBookingsResponseDTO> {
   //    try {
   //       console.log("filters in BookingService.getAllBookingsOfEvent:", filters);

   //       const result: GetBookingsResult = await this._bookingRepository.findBookings(filters);

   //       return {
   //          bookings:   result.bookings.map(mapBookingEntityToResponseDTO),
   //          pagination: result.pagination,
   //       };

   //    } catch (error: unknown) {
   //       const msg = error instanceof Error ? error.message : "Unknown error";
   //       console.error("Error in BookingService.getAllBookingsOfEvent:", msg);
   //       throw error;
   //    }
   // }


   async getBookingById(
      bookingId:        string,
      requestingUserId: string,
      role:             UserRole
   ): Promise<BookingResponseDTO> {
      try {
         const [booking, settings]:[BookingEntityPopulated | null, PlatformSettingsEntity] = await Promise.all([
            this._bookingRepository.getBookingById(bookingId),
            this._settingsService.getPlatformSettings(),
         ]);

         if (!booking) {
            throw createHttpError(HttpStatus.NOT_FOUND, "Booking not found");
         }
         if (role !== "admin" && booking.user.userId !== requestingUserId) {
            throw createHttpError(HttpStatus.FORBIDDEN, "You are not authorised to view this booking");
         }

         return mapBookingEntityToResponseDTO(booking, settings);

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

         await this._processRefundAndCancelBooking(booking!, cancelReason, context);

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

         await this._processRefundAndCancelBooking(booking, `Admin Cancellation: ${cancelReason}`, context);

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

         // Process Confirmed Bookings SEQUENTIALLY (refund + cancel)
         for (const booking of confirmedBookings) {
            try {
               await this._processRefundAndCancelBooking(booking, cancelReason, "event_cancelled");
            } catch (error) {
               // Log individual failures, but let the loop continue processing others
               console.error(`[CRITICAL] Failed to cancel and refund booking ${booking.bookingId}:`, error);
            }
         }

         // Pending Bookings — no payment yet, just mark cancelled
         if (pendingBookings.length > 0) {
            await this._bookingRepository.bulkCancelBookings(
               pendingBookings.map(booking => booking.bookingId),
               { 
                  bookingStatus: BOOKING_STATUS.CANCELLED, 
                  cancellation: { 
                     cancelledAt: new Date(), 
                     reason: cancelReason 
                  } 
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




   private async _processPaymentConfirmationAndBooking(
      booking: BookingEntity, 
      userId: string, 
      paymentId: string, 
      signature: string
   ): Promise<BookingResponseDTO> {
      const session = await this._bookingRepository.startSession();
      session.startTransaction();

      try {
         const adminWalletId = process.env.SUPER_ADMIN_ID!; 

         const event = await this._eventRepository.getEventById(booking.eventRef.toString());
         const eventName = event ? event.title : "Event";

         const qRTokenPayload: QRTokenPayload = {
            userId,
            eventId: booking.eventRef.toString(),
            bookingId: booking.bookingId.toString(), 
         }

         const qrToken: string = this._ticketService.generateQrToken(qRTokenPayload);

         const confirmBookingInput: ConfirmBookingInput = mapConfirmBookingInput(paymentId, signature, qrToken);
         await this._bookingRepository.confirmBooking(booking.bookingId, confirmBookingInput, { session });

         await this._eventRepository.incrementEventTicketAndRevenueStats(
            booking.eventRef.toString(), booking.quantity, booking.totalAmount, { session }
         );

         await this._walletService.creditToWallet({
            userId: adminWalletId,
            amount: booking.totalAmount,
            transactionType: TRANSACTION_TYPE.BOOKING_PAYMENT,
            referenceType: TRANSACTION_REFERENCE_TYPE.BOOKING,
            referenceId: booking.bookingId,
            description: `Payment for booking event (${eventName}). Ticket No: ${booking.ticketNo}`,
            metadata: { paymentId },
         }, { session });

         await session.commitTransaction();

         // await redisClient.del("trending_events");
         await this._cacheService.deleteKeyValue("trending_events");

         const [confirmedBooking, settings]:[BookingEntityPopulated | null, PlatformSettingsEntity] = await Promise.all([
            this._bookingRepository.getBookingById(booking.bookingId),
            this._settingsService.getPlatformSettings(),
         ]);
         
         return mapBookingEntityToResponseDTO(confirmedBooking!, settings);

      } catch (error) {
         await session.abortTransaction();
         throw error;
      } finally {
         session.endSession();
      }
   }



   private async _processRefundAndCancelBooking(
      booking:  BookingEntityPopulated,
      cancelReason:   string,
      context:  RefundContext,
   ): Promise<void> {
      const settings: PlatformSettingsEntity = await this._settingsService.getPlatformSettings();
      const refundAmount: number = calculateRefundAmount(booking, context, settings);

      let refundId: string | undefined;

      console.log('refund amount calculated...:', refundAmount)

      try {
         // ── Initiate the Refund Process (Network call). Webhook will handle the refund process ─────────────────────────
         if (refundAmount > 0) {
            if (!booking.payment?.paymentId) {
               throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, "Payment ID missing — cannot initiate refund");
            }

            console.log('initiating booking refund....');
            
            
            const refundResult: RefundResult = await this._paymentService.initiateBookingRefund({
               paymentId: booking.payment.paymentId,
               bookingId: booking.bookingId,
               amount:    refundAmount
            });            

            refundId = refundResult.refundId;
         }


         // Execute Database Updates with Retry Logic ──
         // Now that Razorpay is done, 
         // Update DB sequentially (No Wallet Transfer Here!)
         console.log('executing transaction with retry...');
         
         await executeWithTransactionRetry(async (session: ClientSession) => {
            // const superAdminId = process.env.SUPER_ADMIN_ID!;

            // Wallet Transfer
            // if (refundAmount > 0) {
            //    // ── Double-Entry Transfer (Debit Admin Wallet-> Credit User Wallet) ───────────────────
            //    await this._walletService.transferFunds({
            //       fromUserId          : superAdminId,
            //       toUserId            : booking.user.userId.toString(),
            //       transferAmount      : refundAmount,
            //       fromTransactionType : TRANSACTION_TYPE.REFUND_ISSUED, // Admin side (debit)
            //       toTransactionType   : TRANSACTION_TYPE.BOOKING_REFUND,  // User side (credit)
            //       referenceType       : TRANSACTION_REFERENCE_TYPE.BOOKING,
            //       referenceId         : booking.bookingId,
            //       description         : `Refund for cancelled booking - ${booking.event.title}. Ticket No.${booking.ticketNo}`,
            //       metadata            : { refundId: refundId }, 
            //    }, { session });
            // }

            // Cancel Booking Document
            const cancellationInput: CancelBookingInput = {
               bookingStatus:  BOOKING_STATUS.CANCELLED,
               // If a refund is expected, mark it PENDING. Webhook will change it to REFUNDED later.
               paymentStatus:  refundAmount > 0 ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.COMPLETED,
               cancellation: {
                  cancelledAt: new Date(),
                  reason: cancelReason,
                  ...(refundId && { refundId: refundId }),
                  // refundedAt: refundAmount > 0 ? new Date() : undefined, // Razorpay sends seconds, JS needs ms or send in ms
                  // Do NOT set refundedAt here. Wait for the webhook.
               },
               // qrToken: "",
            };

            console.log('cancelling booking....');
            
            await this._bookingRepository.cancelBooking(booking.bookingId, cancellationInput, { session });

            console.log('decrementing Event Ticket Booking & Revenue Stats....');

            // Update Event Ticket Booking & Revenue Stats
            await this._eventRepository.decrementEventTicketAndRevenueStats(
               booking.event.eventId,
               booking.quantity,
               booking.totalAmount,
               { session }
            );

         });
         
      } catch (error) {
         console.error("Error in _processRefundAndCancelBooking:", error);
         throw error;
      }

   }



}
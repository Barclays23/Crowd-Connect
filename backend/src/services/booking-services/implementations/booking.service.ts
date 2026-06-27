// backend/src/services/booking-services/implementations/booking.service.ts
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
import { 
   mapBookingEntityToResponseDTO, 
   mapBookingOrderDtoToInput, 
   mapConfirmOnlineBookingInput 
} from "@/mappers/booking.mapper";

import { 
   GetBookingsFilter, 
   GetBookingsResult, 
} from "@/types/booking.types";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { createHttpError } from "@/utils/httpError.utils";
import { 
   CancelBookingInput, 
   BookingEntity, 
   BookingEntityPopulated, 
   ConfirmOnlineBookingInput, 
   CreateBookingInput 
} from "@/entities/booking.entity";
import { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import { IPaymentService } from "@/services/payment-services/interfaces/IPaymentService";
import { ITicketService } from "@/services/ticket-services/interfaces/ITicketService";
import { 
   validateBookingCancelByAuthority, 
   validateBookingCancelByUser, 
   validateEventStatusForBooking, 
   validateInitiateBooking, 
   validateRetryBookingState, 
   validateTicketInventoryForBooking, 
   validateVerifyAndConfirmPayment
} from "@/utils/validations/bookingValidations";
import { calculateRefundAmount, RefundContext } from "@/utils/refundCalculator";
import { UserEntity } from "@/entities/user.entity";
import { EventEntity } from "@/entities/event.entity";
import { DetectedChange } from "@/utils/event-change-detector";
import { ClientSession, Types } from "mongoose";
import { UserRole } from "@/constants/user-system.constants";
import { IWalletService } from "@/services/wallet-services/interfaces/IWalletService";
import { BOOKING_MESSAGES, PAYMENT_MESSAGES, SYSTEM_MESSAGES, WALLET_MESSAGES } from "@/constants/messages.constants";
import { ICacheService } from "@/services/cache-services/interfaces/ICacheService";
import { executeWithTransactionRetry } from "@/utils/transaction.utils";
import { CreateOrderResult, RefundResult } from "@/types/payment.types";
import { IPlatformSettingsService } from "@/services/platform-settings-services/interfaces/IPlatformSettingsService";
import { PlatformSettingsEntity } from "@/entities/platformSettings.entity";
import { QRTokenPayload } from "@/types/ticket.types";
import { PAYMENT_GATEWAY_CONFIG, PAYMENT_METHODS, PAYMENT_STATUSES, PaymentMethod } from "@/constants/payment.constants";
import { TICKET_TYPES } from "@/constants/event.constants";
import { BOOKING_STATUSES } from "@/constants/booking.constants";
import { TRANSACTION_REFERENCE_TYPES, TRANSACTION_TYPES } from "@/constants/transaction.constants";





export class BookingService implements IBookingService {

   constructor(
      private readonly _bookingRepository : IBookingRepository,
      private readonly _eventRepository   : IEventRepository,
      private readonly _userRepository    : IUserRepository,
      private readonly _paymentService    : IPaymentService,
      private readonly _ticketService     : ITicketService,
      private readonly _walletService     : IWalletService,
      private readonly _cacheService      : ICacheService,
      private readonly _settingsService   : IPlatformSettingsService,
   ) {}


   async initiateBooking(bookingReqDto: BookingOrderRequestDTO): Promise<InitiateBookingResponseDTO> {
      try {
         const { eventId, userId, quantity: newBookingQty, paymentMethod } = bookingReqDto;

         console.log('paymentMethod :', paymentMethod)

         const user: UserEntity | null     = await this._userRepository.getUserById(userId);
         const event: EventEntity | null   = await this._eventRepository.getEventById(eventId);
         const existingTicketCount: number = await this._bookingRepository.sumConfirmedTicketsForUser(userId, eventId);

         const ticketsLeft: number         = event ? (event.capacity - event.soldTickets) : 0;

         validateInitiateBooking(user, event, bookingReqDto, existingTicketCount, ticketsLeft);

         const totalAmount: number  = event.ticketPrice * newBookingQty; // ₹0 for free events
         const ticketNo: string     =  this._ticketService.generateTicketNo();

         if (paymentMethod === PAYMENT_METHODS.NONE || event!.ticketType === TICKET_TYPES.FREE) {
            // from userEntity, only userId is used inside this function. I think no need to send full userEntity
            return await this._processFreeBooking(user!, event!, newBookingQty, ticketNo);
         }
         if (paymentMethod === PAYMENT_METHODS.WALLET) {
            // from userEntity, only userId and walletBalance is used inside this function. I think no need to send full userEntity
            return await this._processWalletBooking(user!, event!, newBookingQty, totalAmount, ticketNo);
         }
         if (paymentMethod === PAYMENT_METHODS.ONLINE) {
            // from userEntity, only userId is used inside this function. I think no need to send full userEntity
            return await this._processOnlineBooking(user!, event!, newBookingQty, totalAmount, ticketNo);
         }

         throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Invalid payment method selected.");




         // // ── FREE EVENT ──────────────────────────────────────────────────────────
         // if (event.ticketType === TICKET_TYPE.FREE) {
         //    const newBookingId: string = new Types.ObjectId().toHexString();

         //    const qRTokenPayload: QRTokenPayload = { userId, eventId, bookingId: newBookingId }

         //    const qrToken: string = this._ticketService.generateQrToken(qRTokenPayload);

         //    const createBookingInput: CreateBookingInput = mapBookingOrderDtoToInput({
         //       userId,
         //       event,
         //       newBookingQty,
         //       ticketNo,
         //       qrToken,
         //    })

         //    const bookingEntity: BookingEntity = await this._bookingRepository.createBooking({
         //       _id: newBookingId,
         //       ...createBookingInput,
         //    });

         //    await this._eventRepository.incrementEventTicketAndRevenueStats(eventId, newBookingQty, totalAmount);
            
         //    await this._cacheService.deleteKeyValue("trending_events");

         //    const [populated, settings] = await Promise.all([
         //       this._bookingRepository.getBookingById(bookingEntity.bookingId),
         //       this._settingsService.getPlatformSettings(),
         //    ]);

         //    if (!populated) {
         //       throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, BOOKING_MESSAGES.BOOKING_NOT_FOUND);
         //    }

         //    const populatedBooking: BookingResponseDTO = mapBookingEntityToResponseDTO(populated!, settings);

         //    return {
         //       isFree: true,
         //       populatedBooking
         //    };
         // }





         // // ── PAID EVENT ──────────────────────────────────────────────────────────
         // const paymentOrder = await this._paymentService.createBookingOrder(totalAmount, userId);

         // const createBookingInput: CreateBookingInput = mapBookingOrderDtoToInput({
         //    userId,
         //    event,
         //    newBookingQty,
         //    ticketNo,
         //    paymentOrderId: paymentOrder.orderId,
         // });

         // const pendingBooking: BookingEntity = await this._bookingRepository.createBooking(createBookingInput);
         // console.log('pendingBooking :', pendingBooking )

         // return {
         //    isFree: false,
         //    order: {
         //       bookingId: pendingBooking.bookingId,
         //       orderId: paymentOrder.orderId,
         //       amount: paymentOrder.amount,
         //       currency: paymentOrder.currency,
         //       keyId: process.env.RAZORPAY_KEY_ID!,
         //    },
         // };


      } catch (error: unknown) {
         throw error;
      }
   }



   async retryPayment(bookingId: string, userId: string, paymentMethod: PaymentMethod): Promise<InitiateBookingResponseDTO> {
      const booking: BookingEntityPopulated|null = await this._bookingRepository.getBookingById(bookingId);

      validateRetryBookingState(booking, userId);

      const eventEntity: EventEntity | null = await this._eventRepository.getEventById(booking.event.eventId);

      validateEventStatusForBooking(eventEntity, userId);

      const ticketsLeft: number = eventEntity.capacity - eventEntity.soldTickets;

      validateTicketInventoryForBooking(booking.quantity, ticketsLeft);


      if (paymentMethod === PAYMENT_METHODS.WALLET) {
         return await this._processWalletRetry(booking, userId);
      }
      if (paymentMethod === PAYMENT_METHODS.ONLINE) {
         return await this._processOnlineRetry(booking, userId);
      }

      throw createHttpError(HTTP_STATUS.BAD_REQUEST, PAYMENT_MESSAGES.INVALID_PAYMENT_METHOD);
   }



   // called by both webhook strategy and booking controller (for online payment & booking confirmation)
   async verifyPaymentAndConfirmBooking(userId: string, dto: VerifyPaymentRequestDTO, skipSignatureCheck?: boolean): Promise<BookingResponseDTO>{
      try {
         const { paymentOrderId, paymentId, signature } = dto;

         const booking: BookingEntity | null = await this._bookingRepository.getBookingByOrderId(paymentOrderId);

         if (!booking) {
            throw createHttpError(HTTP_STATUS.NOT_FOUND, BOOKING_MESSAGES.BOOKING_NOT_FOUND);
         }

         // Skip signature check if called from Webhook (already verified securely)
         // ────────────────────────────────────────────────────────────────────────
         // THE IDEMPOTENCY CHECK FIRST (that makes Frontend and Webhooks work together)
         // If the webhook arrives 5 seconds later, but the frontend already confirmed this
         // we just fetch and return the settings and the already-confirmed booking.
         // ────────────────────────────────────────────────────────────────────────
         if (booking.bookingStatus === BOOKING_STATUSES.CONFIRMED) {
            console.log(`Booking ${booking.bookingId} is already confirmed by frontend api. Returning existing data.`);

            const [confirmedBooking, settings]:[BookingEntityPopulated | null, PlatformSettingsEntity] = await Promise.all([
               this._bookingRepository.getBookingById(booking.bookingId),
               this._settingsService.getPlatformSettings(),
            ]);

            return mapBookingEntityToResponseDTO(confirmedBooking!, settings);
         }

         // VALIDATION ONLY AFTER IDEMPOTENCY
         validateVerifyAndConfirmPayment(booking, userId);

         // Verify the signature if it came from the frontend api. 
         // Skip it if it came from the Webhook (because the webhook router already checked the hash).
         if (!skipSignatureCheck) {
            const isValidSignature: boolean = this._paymentService.verifyPaymentSignature(paymentOrderId, paymentId, signature);
            if (!isValidSignature) {
               throw createHttpError(HTTP_STATUS.BAD_REQUEST, PAYMENT_MESSAGES.PAYMENT_VERIFICATION_FAILED);
            }
         }

         // Process the ACID transaction, generate the QR code, update event stats, and credit admin wallet.
         return await this._processBookingConfirmation(booking!, userId, paymentId, signature);

      } catch (error: unknown) {
         const msg = error instanceof Error ? error.message : "Unknown error";
         console.error("Error in BookingService.verifyAndConfirmPayment:", msg);
         throw error;
      }
   }
   


   // for user side bookings list
   async getMyBookings(userId: string, filters: GetBookingsFilter): Promise<GetBookingsResponseDTO> {
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


   async getBookingById(bookingId: string, requestingUserId: string, role: UserRole): Promise<BookingResponseDTO> {
      try {
         const [booking, settings]:[BookingEntityPopulated | null, PlatformSettingsEntity] = await Promise.all([
            this._bookingRepository.getBookingById(bookingId),
            this._settingsService.getPlatformSettings(),
         ]);

         if (!booking) {
            throw createHttpError(HTTP_STATUS.NOT_FOUND, "Booking not found");
         }
         if (role !== "admin" && booking.user.userId !== requestingUserId) {
            throw createHttpError(HTTP_STATUS.FORBIDDEN, "You are not authorised to view this booking");
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
                  bookingStatus: BOOKING_STATUSES.CANCELLED, 
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




   // ─── HANDLER METHODS ───────────────────────────────────────────────────


   private async _processFreeBooking(user: UserEntity, event: EventEntity, quantity: number, ticketNo: string): Promise<InitiateBookingResponseDTO> {
      const newBookingId: string = new Types.ObjectId().toHexString();

      const qRTokenPayload: QRTokenPayload = { userId: user.userId, eventId: event.eventId, bookingId: newBookingId }

      const qrToken: string = this._ticketService.generateQrToken(qRTokenPayload);

      const internalFreeOrderId: string = `free_ord_${newBookingId}`;

      const createBookingInput: CreateBookingInput = mapBookingOrderDtoToInput({
         userId         : user.userId,
         event,
         newBookingQty  : quantity,
         ticketNo, 
         qrToken,
         paymentMethod  : PAYMENT_METHODS.NONE,
         paymentOrderId : internalFreeOrderId,
         bookingStatus  : BOOKING_STATUSES.CONFIRMED,
         paymentStatus  : PAYMENT_STATUSES.COMPLETED
      });

      const bookingEntity = await this._bookingRepository.createBooking({ _id: newBookingId, ...createBookingInput });
      
      await this._eventRepository.incrementEventTicketAndRevenueStats(event.eventId, quantity, 0);
      await this._cacheService.deleteKeyValue("trending_events");

      const [populated, settings] = await Promise.all([
         this._bookingRepository.getBookingById(bookingEntity.bookingId),
         this._settingsService.getPlatformSettings(),
      ]);

      const populatedBooking: BookingResponseDTO = mapBookingEntityToResponseDTO(populated!, settings);

      return {
         isFree            : true,
         paymentMethod     : PAYMENT_METHODS.NONE,
         populatedBooking  : populatedBooking
      };
   }



   
   private async _processWalletBooking(user: UserEntity, event: EventEntity, quantity: number, totalAmount: number, ticketNo: string): Promise<InitiateBookingResponseDTO> {
      if (user.walletBalance < totalAmount) {
         throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Insufficient wallet balance.");
      }

      const newBookingId: string = new Types.ObjectId().toHexString();
      const qRTokenPayload: QRTokenPayload = { userId: user.userId, eventId: event.eventId, bookingId: newBookingId }

      const qrToken: string = this._ticketService.generateQrToken(qRTokenPayload);

      const internalWalletOrderId: string = `wallet_ord_${newBookingId}`;

      // With ACID Transaction ─────────────────────────
      await executeWithTransactionRetry(async (session: ClientSession) => {
         await this._walletService.transferFunds({
            fromUserId           : user.userId,
            toUserId             : process.env.SUPER_ADMIN_ID!,
            transferAmount       : totalAmount,
            fromTransactionType  : TRANSACTION_TYPES.WALLET_PAYMENT,
            toTransactionType    : TRANSACTION_TYPES.BOOKING_PAYMENT,
            referenceType        : TRANSACTION_REFERENCE_TYPES.BOOKING,
            referenceId          : newBookingId,
            description          : `Wallet payment for event ${event.title}`,
         }, { session });

         const createBookingInput: CreateBookingInput = mapBookingOrderDtoToInput({
            userId         : user.userId, 
            event, 
            newBookingQty  : quantity, 
            ticketNo, 
            qrToken,
            paymentMethod  : PAYMENT_METHODS.WALLET,
            paymentOrderId : internalWalletOrderId,
            bookingStatus  : BOOKING_STATUSES.CONFIRMED,
            paymentStatus  : PAYMENT_STATUSES.COMPLETED
         });

         await this._bookingRepository.createBooking({ _id: newBookingId, ...createBookingInput }, { session });

         await this._eventRepository.incrementEventTicketAndRevenueStats(event.eventId, quantity, totalAmount, { session });
      });

      await this._cacheService.deleteKeyValue("trending_events");

      const [populated, settings] = await Promise.all([
         this._bookingRepository.getBookingById(newBookingId),
         this._settingsService.getPlatformSettings(),
      ]);

      const populatedBooking: BookingResponseDTO = mapBookingEntityToResponseDTO(populated!, settings);

      return {
         isFree            : false,
         paymentMethod     : PAYMENT_METHODS.WALLET,
         populatedBooking  : populatedBooking
      };
   }



   private async _processOnlineBooking(user: UserEntity, event: EventEntity, quantity: number, totalAmount: number, ticketNo: string): Promise<InitiateBookingResponseDTO> {
      const paymentOrder: CreateOrderResult = await this._paymentService.createBookingOrder(totalAmount, user.userId);

      const createBookingInput: CreateBookingInput = mapBookingOrderDtoToInput({
         userId         : user.userId,
         event, 
         newBookingQty  : quantity, 
         ticketNo,
         // no qrToken before webhook payment process, verify payment & confirm booking.
         paymentMethod  : PAYMENT_METHODS.ONLINE,
         paymentOrderId : paymentOrder.orderId,
         bookingStatus  : BOOKING_STATUSES.PENDING,
         paymentStatus  : PAYMENT_STATUSES.PENDING
      });

      const pendingBooking: BookingEntity = await this._bookingRepository.createBooking(createBookingInput);

      return {
         isFree         : false,
         paymentMethod  : PAYMENT_METHODS.ONLINE,
         order          : {
            bookingId      : pendingBooking.bookingId,
            orderId        : paymentOrder.orderId,
            amount         : paymentOrder.amount,
            currency       : paymentOrder.currency,
            keyId          : process.env.RAZORPAY_KEY_ID!,
         },
      };
   }



   // Handles retrying a PENDING booking using the user's Wallet balance.
   private async _processWalletRetry(booking: BookingEntityPopulated, userId: string): Promise<InitiateBookingResponseDTO> {
      const user: UserEntity|null = await this._userRepository.getUserById(userId);
      
      if (!user || user.walletBalance < booking.totalAmount) {
         throw createHttpError(HTTP_STATUS.BAD_REQUEST, WALLET_MESSAGES.INSUFFICIENT_WALLET_BALANCE);
      }

      const qRTokenPayload: QRTokenPayload = { 
         userId, 
         eventId: booking.event.eventId.toString(), 
         bookingId: booking.bookingId 
      };
      
      const qrToken: string = this._ticketService.generateQrToken(qRTokenPayload);

      // const internalWalletOrderId: string = `wallet_ord_retry_${booking.bookingId}_${Date.now()}`;
      const internalWalletOrderId: string = `wallet_ord_${booking.bookingId}`;

      // ACID Transaction for Wallet transfer and DB updates
      await executeWithTransactionRetry(async (session: ClientSession) => {
         // Transfer funds
         await this._walletService.transferFunds({
            fromUserId           : userId,
            toUserId             : process.env.SUPER_ADMIN_ID!,
            transferAmount       : booking.totalAmount,
            fromTransactionType  : TRANSACTION_TYPES.WALLET_PAYMENT,
            toTransactionType    : TRANSACTION_TYPES.BOOKING_PAYMENT,
            referenceType        : TRANSACTION_REFERENCE_TYPES.BOOKING,
            referenceId          : booking.bookingId,
            description          : `Wallet Payment for booking event (${booking.event.title}). Ticket No: ${booking.ticketNo}`,
         }, { session });

         // Update existing booking to CONFIRMED
         await this._bookingRepository.confirmWalletRetryBooking(
            booking.bookingId, 
            qrToken, 
            internalWalletOrderId, 
            { session }
         );

         // Update Event Stats (Because PENDING bookings haven't updated revenue yet)
         await this._eventRepository.incrementEventTicketAndRevenueStats(
            booking.event.eventId.toString(), 
            booking.quantity, 
            booking.totalAmount, 
            { session }
         );
      });

      await this._cacheService.deleteKeyValue("trending_events");

      const [populated, settings] = await Promise.all([
         this._bookingRepository.getBookingById(booking.bookingId),
         this._settingsService.getPlatformSettings(),
      ]);

      return {
         isFree            : false,
         paymentMethod     : PAYMENT_METHODS.WALLET,
         populatedBooking  : mapBookingEntityToResponseDTO(populated!, settings)
      };
   }


   // Handles retrying a PENDING booking by generating a new Online Payment Gateway Order.
   private async _processOnlineRetry(booking: BookingEntityPopulated, userId: string): Promise<InitiateBookingResponseDTO> {
      const paymentOrder = await this._paymentService.createBookingOrder(booking.totalAmount, userId);
      
      await this._bookingRepository.updateBookingPaymentOrderId(booking.bookingId, paymentOrder.orderId);

      return {
         isFree         : false,
         paymentMethod  : PAYMENT_METHODS.ONLINE,
         order          : {
            bookingId : booking.bookingId,
            orderId   : paymentOrder.orderId,
            amount    : paymentOrder.amount,
            currency  : paymentOrder.currency,
            keyId     : PAYMENT_GATEWAY_CONFIG.PUBLIC_KEY
         }
      };
   }



   // for online payment bookings
   private async _processBookingConfirmation(
      booking  : BookingEntity, 
      userId   : string, 
      paymentId: string, 
      signature: string
   ): Promise<BookingResponseDTO> {
      const session: ClientSession = await this._bookingRepository.startSession();
      session.startTransaction();

      try {
         const event: EventEntity | null = await this._eventRepository.getEventById(booking.eventRef.toString());
         const eventName:string = event ? event.title : "Event";

         // creating payload from here or inside _ticketService.generateQrToken ?? which is correct? solid principle
         const qRTokenPayload: QRTokenPayload = {
            userId,
            eventId  : booking.eventRef.toString(),
            bookingId: booking.bookingId.toString(), 
         }

         const qrToken: string = this._ticketService.generateQrToken(qRTokenPayload);

         const confirmBookingInput: ConfirmOnlineBookingInput = mapConfirmOnlineBookingInput(paymentId, signature, qrToken);
         await this._bookingRepository.confirmOnlineBooking(booking.bookingId, confirmBookingInput, { session });

         await this._eventRepository.incrementEventTicketAndRevenueStats(
            booking.eventRef.toString(), booking.quantity, booking.totalAmount, { session }
         );

         const adminWalletId: string = process.env.SUPER_ADMIN_ID!;

         await this._walletService.creditToWallet({
            userId            : adminWalletId,
            amount            : booking.totalAmount,
            transactionType   : TRANSACTION_TYPES.BOOKING_PAYMENT,
            referenceType     : TRANSACTION_REFERENCE_TYPES.BOOKING,
            referenceId       : booking.bookingId,
            description       : `Payment for booking event (${eventName}). Ticket No: ${booking.ticketNo}`,
            metadata          : { paymentId },
         }, { session });

         await session.commitTransaction();

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
               throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Payment ID missing — cannot initiate refund");
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
         // Update DB sequentially
         // (No Wallet Transfer Here! wallet transfer of refund will do by webhook and refund strategy)
         console.log('executing transaction with retry...');
         
         await executeWithTransactionRetry(async (session: ClientSession) => {
            // Cancel Booking Document
            const cancellationInput: CancelBookingInput = {
               bookingStatus:  BOOKING_STATUSES.CANCELLED,
               // If a refund is expected, mark it PENDING. Webhook will change it to REFUNDED later.
               paymentStatus:  refundAmount > 0 ? PAYMENT_STATUSES.PENDING : PAYMENT_STATUSES.COMPLETED,
               cancellation: {
                  cancelledAt: new Date(),
                  reason: cancelReason,
                  ...(refundId && { refundId: refundId }),
                  // refundedAt: refundAmount > 0 ? new Date() : undefined, // Razorpay sends seconds, JS needs ms or send in ms
                  // Do NOT set refundedAt timestamp here. Wait for the webhook.
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



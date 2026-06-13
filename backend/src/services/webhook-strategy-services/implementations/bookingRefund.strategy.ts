
// src/backend/services/webhook-strategy-services/bookingRefund.strategy.ts

import { IBookingRepository } from "@/repositories/interfaces/IBookingRepository";
import { IWalletService } from "@/services/wallet-services/interfaces/IWalletService";
import { executeWithTransactionRetry } from "@/utils/transaction.utils";
import { ClientSession } from "mongoose";
import { BOOKING_STATUS, PAYMENT_STATUS } from "@/types/booking.types";
import { TRANSACTION_REFERENCE_TYPE, TRANSACTION_TYPE } from "@/types/wallet.types";
import { 
    BookingEntityPopulated, 
    CancelBookingInput, 
    MarkRefundedInput 
} from "@/entities/booking.entity";
import { IRefundStrategy } from "@/services/webhook-strategy-services/interfaces/IRefundStrategy";
import { StandardWebhookEvent } from "@/types/webhook.types";





export class BookingRefundStrategy implements IRefundStrategy {
    constructor(
        private readonly _bookingRepository: IBookingRepository,
        private readonly _walletService: IWalletService
    ) {}


    async executeRefund(webhookEvent: StandardWebhookEvent): Promise<void> {
        const refundId      : string = webhookEvent.refundId!;
        const paymentId     : string = webhookEvent.paymentId;
        const refundAmount  : number = webhookEvent.amount;  // Do NOT divide by 100! Provider already did it.

        console.log(`[Webhook Strategy] Processing confirmed booking refund ${refundId} for payment ${paymentId}`);

        const booking: BookingEntityPopulated | null = await this._bookingRepository.getBookingByPaymentId(paymentId);

        if (!booking) {
            console.error(`[Webhook Error] No booking found for paymentId: ${paymentId}`);
            return;
        }

        
        if (booking.payment?.status === PAYMENT_STATUS.REFUNDED) {
            console.log(`[Webhook] Booking ${booking.bookingId} is already refunded. Ignoring.`);
            return; 
        }

        const superAdminId = process.env.SUPER_ADMIN_ID!;

        await executeWithTransactionRetry(async (session: ClientSession) => {
            // 1. Wallet Transfer
            await this._walletService.transferFunds({
                fromUserId          : superAdminId,
                toUserId            : booking.user.userId, 
                transferAmount      : refundAmount,
                fromTransactionType : TRANSACTION_TYPE.REFUND_ISSUED,
                toTransactionType   : TRANSACTION_TYPE.BOOKING_REFUND,
                referenceType       : TRANSACTION_REFERENCE_TYPE.BOOKING,
                referenceId         : booking.bookingId.toString(),
                description         : `Refund for cancelled booking - ${booking.event?.title || 'Event'}. Ticket No.${booking.ticketNo}`,
                metadata            : { refundId },
            }, { session });


            // Mark Booking Cancelled (if not already cancelled, or refund directly from webhook dashboard)
            if (booking.bookingStatus !== BOOKING_STATUS.CANCELLED) {
                const cancelDetails: CancelBookingInput = {
                    bookingStatus   : BOOKING_STATUS.CANCELLED,
                    paymentStatus   : refundAmount > 0 ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.COMPLETED,
                    cancellation: {
                        cancelledAt : new Date(webhookEvent.timestamp),  // Use the normalized timestamp!
                        reason      : 'Manual refund issued via Payment Gateway Dashboard',
                        ...(refundId && { refundId: refundId }),
                    },
                };

                await this._bookingRepository.cancelBooking(booking.bookingId, cancelDetails, { session });
            }

            // 2. Mark Refunded
            const refundDetails: MarkRefundedInput = {
                paymentStatus   : PAYMENT_STATUS.REFUNDED,
                refundId        : refundId,
                refundedAt      : new Date(webhookEvent.timestamp)  // Use the normalized timestamp!
            };

            await this._bookingRepository.markBookingAsRefunded(booking.bookingId, refundDetails, { session });
        });

        console.log(`✅ [Strategy] Booking Refund ${refundId} successfully applied to wallet.`);
    }
}
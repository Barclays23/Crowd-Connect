
// src/backend/services/webhook-strategy-services/hostingFeeRefund.strategy.ts

import { IBookingRepository } from "@/repositories/interfaces/IBookingRepository";
import { IWalletService } from "@/services/wallet-services/interfaces/IWalletService";
// import { executeWithTransactionRetry } from "@/utils/transaction.utils";
// import { ClientSession } from "mongoose";
// import { PAYMENT_STATUS } from "@/types/booking.types";
// import { TRANSACTION_REFERENCE_TYPE, TRANSACTION_TYPE } from "@/types/wallet.types";
// import { MarkRefundedInput } from "@/entities/booking.entity";
import { IRefundStrategy } from "@/services/webhook-strategy-services/interfaces/IRefundStrategy";
import { StandardWebhookEvent } from "@/types/webhook.types";





export class HostingFeeRefundStrategy implements IRefundStrategy {
    constructor(
        private readonly _bookingRepository: IBookingRepository,
        private readonly _walletService: IWalletService
    ) {}


    async executeRefund(refundData: StandardWebhookEvent): Promise<void> {
        console.log('HOSTING FEE refundData :', refundData)
        // const refundId: string = refundData.id;
        // const paymentId: string = refundData.payment_id;
        // const refundAmount = refundData.amount / 100; 

        // SAME LIKE BOOKING REFUND BOOKING STRATEGY FUNCTION

        // const booking = await this._bookingRepository.getBookingByPaymentId(paymentId);

        // if (!booking) {
        //     console.error(`[Webhook Error] No booking found for paymentId: ${paymentId}`);
        //     return;
        // }
        
        // if (booking.payment?.status === PAYMENT_STATUS.REFUNDED) {
        //     console.log(`[Webhook] Booking ${booking.bookingId} is already refunded. Ignoring.`);
        //     return; 
        // }

        // const superAdminId = process.env.SUPER_ADMIN_ID!;

        // await executeWithTransactionRetry(async (session: ClientSession) => {
        //     // 1. Wallet Transfer
        //     await this._walletService.transferFunds({
        //         fromUserId          : superAdminId,
        //         toUserId            : booking.user.userId, 
        //         transferAmount      : refundAmount,
        //         fromTransactionType : TRANSACTION_TYPE.REFUND_ISSUED,
        //         toTransactionType   : TRANSACTION_TYPE.BOOKING_REFUND,
        //         referenceType       : TRANSACTION_REFERENCE_TYPE.BOOKING,
        //         referenceId         : booking.bookingId.toString(),
        //         description         : `Refund for cancelled booking - ${booking.event?.title || 'Event'}. Ticket No.${booking.ticketNo}`,
        //         metadata            : { refundId },
        //     }, { session });

        //     // 2. Mark Refunded
        //     const refundDetails: MarkRefundedInput = {
        //         paymentStatus: PAYMENT_STATUS.REFUNDED,
        //         refundId: refundId,
        //         refundedAt: new Date(refundData.created_at * 1000)  
        //     };

        //     await this._bookingRepository.markBookingAsRefunded(booking.bookingId, refundDetails, { session });
        // });

        // console.log(`✅ [Strategy] Booking Refund ${refundId} applied.`);
    }
}
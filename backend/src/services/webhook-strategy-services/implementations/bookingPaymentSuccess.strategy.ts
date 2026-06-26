// backend/src/services/webhook-strategy-services/implementations/bookingPaymentSuccess.strategy.ts
import { IBookingRepository } from "@/repositories/interfaces/IBookingRepository";
import { IPaymentSuccessStrategy } from "../interfaces/IPaymentSuccessStrategy";
import { StandardWebhookEvent } from "@/types/webhook.types";
import { BookingService } from "@/services/booking-services/implementations/booking.service";
import { VerifyPaymentRequestDTO } from "@/dtos/booking.dto";
import { BOOKING_STATUSES } from "@/constants/booking.constants";





export class BookingPaymentSuccessStrategy implements IPaymentSuccessStrategy {
    constructor(
        private readonly _bookingRepository: IBookingRepository,
        private readonly _bookingService: BookingService 
    ) {}


    async executeSuccess(webhookEvent: StandardWebhookEvent): Promise<void> {
        const { orderId, paymentId } = webhookEvent;

        const booking = await this._bookingRepository.getBookingByOrderId(orderId);

        if (!booking) {
            console.error(`[Webhook Error] No booking found for orderId: ${orderId}`);
            return;
        }

        // IDEMPOTENCY: If user already verified via frontend, do nothing.
        if (booking.bookingStatus === BOOKING_STATUSES.CONFIRMED) {
            console.log(`[Webhook] Booking ${booking.bookingId} is already confirmed. Safe exit.`);
            return;
        }

        console.log(`[Webhook] Confirming pending booking ${booking.bookingId} via Webhook Fallback`);

        const dto: VerifyPaymentRequestDTO = {
            bookingId       : booking.bookingId.toString(),
            paymentOrderId  : orderId,
            paymentId       : paymentId,
            signature       : "verified-by-webhook" // Safe: Webhook router already verified the payload hash
        };

        // Note: You must update verifyAndConfirmBookingPayment in BookingService to accept a `skipSignatureCheck` flag 
        // and bypass `this._paymentService.verifyPaymentSignature` when called from this webhook.
        await this._bookingService.verifyAndConfirmBookingPayment(booking.userRef.toString(), dto, true);
    }
}
// backend/src/services/webhook-strategy-services/implementations/bookingPaymentFailed.strategy.ts
import { IBookingRepository } from "@/repositories/interfaces/IBookingRepository";
import { IPaymentFailedStrategy } from "../interfaces/IPaymentFailedStrategy";
import { StandardWebhookEvent } from "@/types/webhook.types";
import { BOOKING_STATUSES } from "@/constants/booking.constants";
import { BookingEntity } from "@/entities/booking.entity";




export class BookingPaymentFailedStrategy implements IPaymentFailedStrategy {
    constructor(
        private readonly _bookingRepository: IBookingRepository
    ) {}



    async executeFailed(webhookEvent: StandardWebhookEvent): Promise<void> {
        const { orderId } = webhookEvent;

        const booking: BookingEntity | null = await this._bookingRepository.getBookingByOrderId(orderId);

        if (!booking) {
            // ✅ Throw to force a retry
            throw new Error(`[Webhook Error] Failed to find booking for failed payment orderId: ${orderId}`);
        }

        if (!booking || booking.bookingStatus !== BOOKING_STATUSES.PENDING) {
            return; // Ignore if booking doesn't exist or is already resolved
        }

        console.log(`[Webhook] Marking payment failed for pending booking ${booking.bookingId}`);

        // Update ONLY the payment status to FAILED.
        // We leave the bookingStatus as PENDING so the user can hit "Retry Payment" on the frontend.
        await this._bookingRepository.markBookingPaymentFailed(booking.bookingId.toString());
    }
}
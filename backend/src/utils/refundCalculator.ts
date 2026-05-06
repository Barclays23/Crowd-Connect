// backend/src/utils/refundCalculator.ts

import { BookingEntityPopulated } from "@/entities/booking.entity";

import { PlatformSettingsEntity } from "@/entities/platformSettings.entity";



export type RefundContext = "user" | "authority" | "event_cancelled";


export type RefundBookingInput = {
    ticketRate: number;
    totalAmount: number;
    gracePeriodEnd?: Date | null;
    event: {
        startDateTime: Date;
    };
};




export function calculateRefundAmount(
    booking: BookingEntityPopulated,
    context: RefundContext,
    settings: PlatformSettingsEntity
): number {
    console.log('booking.ticketRate     :', booking.ticketRate)
    console.log('booking.quantity       :', booking.quantity)
    console.log('booking.totalAmount    :', booking.totalAmount)
    console.log('cancel context         :', context)


    // Free ticket — nothing to refund
    if (booking.totalAmount === 0) return 0;
    

    // let refundAmount: number;


    // Authority or event cancellation → always 100% refund (no commission deduction)
    if (context === 'authority' || context === 'event_cancelled') {
        return booking.totalAmount;
    }


    // Grace period active (major event change) → full grace period refund %
    const isGraceActive = !!booking.gracePeriodEnd && new Date() <= new Date(booking.gracePeriodEnd);
    console.log('isGraceActive      :', isGraceActive)

    if (isGraceActive) {
        return Math.round((booking.totalAmount * settings.gracePeriodRefundPercent) / 100);
    }


    // Standard user cancellation — remaining time-based tiers ────────────────
    const refundPercent = getRefundPercentage(booking, settings);
    console.log('refundPercent   :', refundPercent)

    if (refundPercent === 0) return 0;

    return Math.round((booking.totalAmount * refundPercent) / 100);

    // NOTE ON ADMIN COMMISSION:
    // Commission (settings.commissionPercent) is NOT deducted here.
    // The user always gets back the full percentage of what they paid.
    // Commission is deducted when calculating HOST PAYOUTS, not refunds.
    // Example: User paid ₹1000. 50% refund = user gets ₹500 back.
    // The admin wallet absorbs this. Commission accounting happens at payout time.
}


export function getRefundPercentage(
    booking: BookingEntityPopulated, 
    settings: PlatformSettingsEntity
): number {

    const now               = new Date();
    const eventStart        = new Date(booking.event.startDateTime);
    const hoursUntilEvent   = (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    console.log('Hours Left Until Event :', hoursUntilEvent);

    if (hoursUntilEvent >= settings.refundTier1Hours) {
        return settings.refundTier1Percent;     // e.g. >= 48h → 100%
    }
    if (hoursUntilEvent >= settings.refundTier2Hours) {
        return settings.refundTier2Percent;     // e.g. 24–48h → 50%
    }
    if (hoursUntilEvent > 0) {
        return settings.refundTier3Percent;     // e.g. 0-24h   → 25%
    }

    // hoursUntilEvent <= 0 → event already started → 0% (no refund)
    return 0;
}
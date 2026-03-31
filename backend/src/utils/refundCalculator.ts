// backend/src/utils/refundCalculator.ts

import { BookingEntityPopulated } from "@/entities/booking.entity";
import { 
    ABOVE_H48_REFUND_PERCENT, 
    ADMIN_COMMISSION_PERCENT, 
    BELOW_H24_REFUND_PERCENT, 
    BELOW_H48_REFUND_PERCENT, 
    // GRACE_PERIOD_REFUND_PERCENT, 
    NO_REFUND_PERCENT 
} from "@/types/payment.types";

export type RefundContext = "user" | "authority" | "event_cancelled";


export type RefundBookingInput = {
    ticketRate: number;
    totalAmount: number;
    refundGracePeriodEnd?: Date | null;
    event: {
        startDateTime: Date;
    };
};


export function calculateRefundAmount(
    booking: BookingEntityPopulated,
    context: RefundContext
): number {
    console.log('booking.ticketRate :', booking.ticketRate)
    console.log('booking.quantity :', booking.quantity)
    console.log('booking.totalAmount :', booking.totalAmount)
    console.log('cancel context :', context)
    
    if (booking.totalAmount === 0) return 0;

    // ── Full refund cases — no commission deduction ──────────────────────────
    const isGraceActive = !!booking.refundGracePeriodEnd && new Date() <= booking.refundGracePeriodEnd;
    console.log('isGraceActive :', isGraceActive)
    if (
        context === "event_cancelled" || 
        context === "authority" || 
        isGraceActive
    ) {
        return booking.totalAmount;
    }


    // ── Standard user cancellation — admin retains commission ────────────────
    const refundPercentage = getRefundPercentage(booking);
    console.log('refundPercentage :', refundPercentage)
    
    if (refundPercentage === NO_REFUND_PERCENT) return 0;
    
    const refundAmount: number =  Math.round(
        booking.totalAmount * (refundPercentage / 100) * (1 - ADMIN_COMMISSION_PERCENT / 100)
    );
    console.log('ADMIN_COMMISSION_PERCENT :', ADMIN_COMMISSION_PERCENT)
    console.log('refundAmount :', refundAmount)

    return refundAmount;
}


export function getRefundPercentage(booking: RefundBookingInput): number {
    // const isGraceActive = !!booking.refundGracePeriodEnd && new Date() <= booking.refundGracePeriodEnd;

    // if (isGraceActive) return GRACE_PERIOD_REFUND_PERCENT;

    const hoursToStart = (new Date(booking.event.startDateTime).getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursToStart >= 48) return ABOVE_H48_REFUND_PERCENT;
    if (hoursToStart >= 24) return BELOW_H48_REFUND_PERCENT;
    if (hoursToStart > 0)   return BELOW_H24_REFUND_PERCENT;
    return NO_REFUND_PERCENT;
}
// frontend/src/components/user/BookingDetails.tsx

import {
  CreditCard, Info, AlertOctagon,
  Plane
} from "lucide-react";
import { Badge }        from "@/components/ui/badge";
import { formatDate5 }  from "@/utils/dateAndTimeFormats";
import { BOOKING_STATUS, PAYMENT_STATUS } from "@/types/booking.types";
import type { IBookingState }           from "@/types/booking.types";
import { getPaymentStatusVariant } from "@/utils/UI.utils";
import EventMap2 from "@/components/common/EventMap2";
import { EVENT_FORMATS } from "@/types/event.types";
import BookingTicket from "@/components/booking/BookingTicket";


// Horizontal layout for lists in the lower cards
function DetailRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-(--border-muted) last:border-0">
      <span className="text-sm font-medium text-(--text-secondary) shrink-0">{label}</span>
      <span className={`text-sm font-medium text-(--text-primary) text-right ${mono ? "font-mono text-(--text-tertiary)" : ""}`}>
        {value}
      </span>
    </div>
  );
}


interface BookingDetailsProps {
  booking: IBookingState;
}

function BookingDetails({ booking }: BookingDetailsProps) {
  const isOnline    = booking.event.format === EVENT_FORMATS.ONLINE;
  const isFree      = booking.totalAmount === 0;
  const isCancelled = booking.bookingStatus === BOOKING_STATUS.CANCELLED;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">

      {/* ── 1. BOARDING PASS / TICKET ────────────────────────────── */}
      <BookingTicket booking={booking} />

      {/* ── 2. EVENT LOCATION MAP (Offline Only) ──────────────────────── */}
      {!isOnline && booking.event.locationName && (
         <EventMap2 locationName={booking.event.locationName} />
      )}

      {/* ── PAYMENT & STATUS ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

         {/* Payment Summary Card */}
         <div className="rounded-xl border border-(--border-default) bg-(--card-bg) shadow-(--shadow-sm) overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-(--table-header-bg) border-b border-(--border-brand) flex items-center justify-between">
               <div className="flex items-center gap-2">
               <CreditCard className="w-5 h-5 text-(--text-secondary)" />
               <h3 className="text-sm font-bold uppercase tracking-wider text-(--text-primary)">
                  Payment Summary
               </h3>
               </div>
               <Badge variant={getPaymentStatusVariant(booking.payment.status)} className="text-xs">
                  {booking.payment.status.toUpperCase()}
               </Badge>
            </div>

            <div className="p-6 flex-1 space-y-6">
               {/* Prominent Total */}
               <div className="flex items-baseline justify-between pb-4 border-b border-(--border-muted)">
               <span className="text-lg font-semibold text-(--text-primary)">Total Amount</span>
               <span
                  className={`
                     text-2xl md:text-3xl font-black tracking-tight
                     ${isFree ? 'text-(--status-success)' : 'text-(--brand-primary)'}
                  `}
               >
                  {isFree ? "FREE" : `₹${booking.totalAmount.toLocaleString("en-IN")}`}
               </span>
               </div>

               {/* Timeline / Key Dates */}
               <div className="space-y-4">
                  <DetailRow
                     label="Booked On"
                     value={formatDate5(booking.createdAt) || "—"}
                  />

                  {/* Paid At – only show if payment actually happened */}
                  {booking.payment.status === PAYMENT_STATUS.COMPLETED && booking.payment && (
                     <DetailRow
                        label="Paid On"
                        value={formatDate5(booking.payment.paidAt)}
                     />
                  )}

                  {/* Razorpay details – only for paid bookings */}
                  {!isFree && booking.payment.status !== PAYMENT_STATUS.PENDING && (
                     <>
                        <DetailRow
                        label="Order ID"
                        value={booking.payment.orderId || "—"}
                        mono
                        />
                        <DetailRow
                        label="Payment ID"
                        value={booking.payment.paymentId || "—"}
                        mono
                        />
                     </>
                  )}

                  {/* Refund information – only when applicable */}
                  {isCancelled && booking.cancellation && (
                  (booking.cancellation.refundId || booking.cancellation.refundedAt) && (
                     <div className="pt-4 border-t border-(--badge-error-border) space-y-5 mt-2">
                        <div className="bg-(--badge-warning-bg)/40 p-4 rounded-lg border border-(--badge-warning-border)/50">
                        <p className="text-xs font-bold uppercase tracking-widest text-(--status-warning) mb-1.5">
                           Refund Processing
                        </p>
                        <p className="text-sm text-(--text-primary) leading-relaxed">
                           {booking.cancellation.refundedAt
                              ? "Refund has been processed."
                              : "Refund is being processed — usually completes within 5–10 business days."}
                        </p>
                        </div>

                        <div className="space-y-4">
                        {booking.cancellation.refundedAt && (
                           <DetailRow
                              label="Refunded On"
                              value={formatDate5(booking.cancellation.refundedAt)}
                           />
                        )}

                        {booking.cancellation.refundId && (
                           <DetailRow
                              label="Refund Reference / ID"
                              value={booking.cancellation.refundId}
                              mono
                           />
                        )}

                        {/* Optional: show if you later add estimated / grace period info */}
                        {booking.gracePeriodEnd && (
                           <DetailRow
                              label="Refund Period Ends"
                              value={formatDate5(booking.gracePeriodEnd)}
                           />
                        )}
                        </div>
                     </div>
                  )
                  )}
               </div>

               {/* Extra space filler if content is short */}
               <div className="flex-1 min-h-20" />
            </div>
         </div>

         {/* Booking Status / Cancellation Card */}
         <div
            className={`
               rounded-xl border overflow-hidden shadow-(--shadow-sm) flex flex-col
               ${isCancelled
               ? 'border-(--badge-error-border) bg-(--badge-error-bg)/30'
               : 'border-(--border-default) bg-(--card-bg)'}
            `}
         >
            <div
               className={`
               px-6 py-4 border-b flex items-center gap-2
               ${isCancelled
                  ? 'bg-(--badge-error-bg) border-(--badge-error-border)'
                  : 'bg-(--table-header-bg) border-(--border-brand)'}
               `}
            >
               {isCancelled ? (
               <AlertOctagon className="w-5 h-5 text-(--status-error)" />
               ) : (
               <Info className="w-5 h-5 text-(--text-secondary)" />
               )}
               <h3
               className={`
                  text-sm font-bold uppercase tracking-wider
                  ${isCancelled ? 'text-(--status-error)' : 'text-(--text-primary)'}
               `}
               >
               {isCancelled ? "Cancellation Details" : "Booking Status"}
               </h3>
            </div>

            <div className="p-6 flex-1 space-y-6">
               {/* Core timeline */}
               <div className="space-y-4">
               <DetailRow
                  label="Booked On"
                  value={formatDate5(booking.createdAt) || "—"}
               />

               {booking.checkedInAt && (
                  <DetailRow
                     label="Checked In On"
                     value={formatDate5(booking.checkedInAt)}
                  />
               )}

               {isCancelled && booking.cancellation && (
                  <>
                     <DetailRow
                     label="Cancelled On"
                     value={formatDate5(booking.cancellation.cancelledAt)}
                     />

                     <div className="pt-3 border-t border-(--badge-error-border)">
                     <div className="bg-(--badge-error-bg)/60 p-4 rounded-lg border border-(--badge-error-border)/40">
                        <p className="text-xs font-bold text-(--status-error) uppercase tracking-widest mb-1.5">
                           Cancellation Reason
                        </p>
                        <p className="text-sm text-(--text-primary) leading-relaxed">
                           {booking.cancellation.reason || "No reason provided"}
                        </p>
                     </div>
                     </div>

                     {booking.cancellation.refundId && (
                     <DetailRow
                        label="Refund Reference"
                        value={booking.cancellation.refundId}
                        mono
                     />
                     )}
                  </>
               )}
               </div>

               {/* Placeholder / instruction when nothing dramatic happened */}
               {!isCancelled && !booking.checkedInAt && (
               <div className="flex flex-col items-center justify-center py-12 text-(--text-tertiary) opacity-70 mt-4">
                  <Plane className="w-12 h-12 mb-4 opacity-40" />
                  <p className="text-center text-sm max-w-70">
                     Booking confirmed • Show your Entry Pass QR code at the venue
                  </p>
               </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

export default BookingDetails;
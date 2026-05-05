
import { BOOKING_STATUS, IBookingModel, IBookingVirtuals, PAYMENT_STATUS } from '@/types/booking.types';
import { IEventModel } from '@/types/event.types';
import { getRefundPercentage } from '@/utils/refundCalculator';
import { Model } from 'mongoose';
import { Schema, model, HydratedDocument } from 'mongoose';


// const bookingSchema = new Schema<IBookingModel, Model<IBookingModel, {}, {}, IBookingVirtuals>, {}, IBookingVirtuals>(
const bookingSchema = new Schema<IBookingModel>(
   {
      eventRef: {
         type: Schema.Types.ObjectId,
         ref: 'Event',
         required: true,
         index: true,
      },
      userRef: {
         type: Schema.Types.ObjectId,
         ref: 'User',
         required: true,
         index: true,
      },
      quantity: {
         type: Number,
         required: true,
         min: 1,
         max: 10
      },
      ticketRate: {
         type: Number,
         required: true,
         min: 0,
      },
      ticketNo: {
         type: String,
         required: true,
      },
      totalAmount: {
         type: Number,
         required: true,
         min: 0,
      },
      bookingStatus: {
         type: String,
         enum: Object.values(BOOKING_STATUS),
         default: BOOKING_STATUS.PENDING,
         required: true,
      },

      // ── QR / Entry ─────────────────────────────────────────────────────────────
      qrToken: {
         type: String,
         default: undefined
      },
      remainingEntries: {
         type: Number,
         required: true,
         min: 0,
      },
      checkedInAt: {
         type: Date,
      },
      payment: {
         orderId  : { type: String, required: true },
         paymentId: { type: String },
         signature: { type: String },
         status: {
            type: String,
            enum: Object.values(PAYMENT_STATUS),
            default: PAYMENT_STATUS.PENDING,
            required: true,
         },
         paidAt: { type: Date },
      },

      cancellation: {
         reason: { type: String, trim: true },
         cancelledAt: { type: Date },
         refundId: { type: String },
         refundedAt: { type: Date },
      },

      // --- Major Change & Grace Period ---
      majorEventChange: {
         changedAt:  { type: Date },
         changeType: { type: String, enum: ['DATE', 'VENUE', 'PRICE', 'CAPACITY', 'OTHER'] },
         summary:    { type: String },
      },

      refundGracePeriodEnd: {    // If set → full refund allowed until this time
         type: Date,
         default: null,
      },

      // refundAmount: { type: Number },
      // refundStatus: {
      //    type: String,
      //    enum: ['PENDING', 'PROCESSED', 'FAILED'],
      // },
   },
   {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
   }
);






// ── Virtuals ──────────────────────────────────────────────────────────────────

// Is a major-change grace period currently active?
bookingSchema.virtual("isGraceRefundActive").get(function (this: IBookingModel) {
  return !!this.refundGracePeriodEnd && new Date() <= this.refundGracePeriodEnd;
});


// What refund percentage does this user get if they cancel right now?
// NOTE: for USER refund calculation only.
// Host payout is NOT affected — hosts earn all CONFIRMED + ATTENDED bookings.

function isPopulatedEvent(event: unknown): event is IEventModel {
   return typeof event === "object" && event !== null && "startDateTime" in event;
}


bookingSchema.virtual("currentRefundPercentage").get(function (
   this: IBookingModel & IBookingVirtuals
) {
   if (this.bookingStatus !== BOOKING_STATUS.CONFIRMED) return 0;

   if (!isPopulatedEvent(this.eventRef)) return 0;

   return getRefundPercentage({
      ticketRate: this.ticketRate,
      totalAmount: this.totalAmount,
      refundGracePeriodEnd: this.refundGracePeriodEnd,
      event: {
         startDateTime: this.eventRef.startDateTime
      }
   });
});





// ── Indexes ──────────────────────────────────────────────────────────────────

bookingSchema.index({ userRef: 1, createdAt: -1 });                      // "My bookings" — newest first
bookingSchema.index({ userRef: 1, eventRef: 1 });                        // Duplicate-booking check + ticket-cap enforcement
bookingSchema.index({ eventRef: 1, bookingStatus: 1 });                  // Host dashboard — filter by status per event
bookingSchema.index({ ticketNo: 1 }, { unique: true });
bookingSchema.index(
   { qrToken: 1 },
   // { unique: true, partialFilterExpression: { qrToken: { $exists: true } }}
   { unique: true, partialFilterExpression: { qrToken: { $type: "string", $ne: "" } }}
);     // QR scan — sparse skips empty-string PENDING rows
bookingSchema.index({ refundGracePeriodEnd: 1 }, { sparse: true });      // Grace-period queries — sparse skips null rows
bookingSchema.index({ "payment.orderId": 1 }, { unique: true });         // Webhook lookup — must be unique



// ── Pre-save hooks ───────────────────────────────────────────────────────────

bookingSchema.pre("save", async function (this: HydratedDocument<IBookingModel>) {
   // Keep totalAmount in sync with quantity × ticketRate
   // Recalculate totalAmount if quantity or ticketRate changes.
   if (this.isModified("quantity") || this.isModified("ticketRate")) {
      this.totalAmount = this.quantity * this.ticketRate;
   }

   // remainingEntries must not exceed quantity
   if (this.isNew) {
      this.remainingEntries = this.quantity;
   }
});


// const Booking = model<IBookingModel>('Booking', bookingSchema);
const Booking: Model<IBookingModel> = model<IBookingModel>("Booking", bookingSchema);
export default Booking;

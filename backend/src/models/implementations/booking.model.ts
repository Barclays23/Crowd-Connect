import { Schema, model, Document, Types } from 'mongoose';

export enum BOOKING_STATUS {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',   // or isRefunded separate? which is best??
  FAILED = 'FAILED',
  // need any ATTENDED status ?? when admin making the payout after event, 
  // which status is should consider for calculation? 
  // based on CONFIRMED count or only those who are ATTENDED count
  // booking confirmed, but not attended - what should this amount do? applicable for payout or host wont get this amount? what is good?
}


export interface IBooking extends Document {
  eventRef: Types.ObjectId;
  userRef: Types.ObjectId;
  quantity: number;
  ticketRate: number;          // locked price at time of booking (per ticket)
  totalAmountPaid: number;          // quantity × ticketPricePaid + any fees
  qrCodes: Array<{ code: string; scanned: boolean; scannedAt?: Date }>;
  bookingStatus: BOOKING_STATUS;
  paymentId?: string;               // Razorpay payment/charge ID
  createdAt: Date;
  updatedAt: Date;

  // --- Change & Refund Grace ---
  majorEventChange?: {
    changedAt: Date;
    type: 'DATE' | 'VENUE' | 'PRICE' | 'OTHER';
    summary: string;                // e.g. "Date changed from 15 Mar to 20 Apr 2026"
  };

  refundGracePeriodEnd?: Date;      // If set → full refund allowed until this time

  // Refund tracking (when cancelled/refunded)
  cancelledAt?: Date;
  refundAmount?: number;
  refundStatus?: 'PENDING' | 'PROCESSED' | 'FAILED';
  refundId?: string;                // Razorpay refund ID
}

const bookingSchema = new Schema<IBooking>(
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
    },
    ticketPricePaid: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    qrCodes: [{
      code: { type: String, required: true },
      scanned: { type: Boolean, default: false },
      scannedAt: { type: Date },
    }],
    bookingStatus: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
      index: true,
    },
    paymentId: {
      type: String,
      sparse: true,
    },

    // --- Major Change & Grace Period ---
    majorEventChange: {
      type: {
        changedAt: { type: Date },
        type: {
          type: String,
          enum: ['DATE', 'VENUE', 'PRICE', 'CAPACITY', 'OTHER'],
        },
        summary: { type: String },
      },
      default: null,
    },

    refundGracePeriodEnd: {
      type: Date,
      default: null,
    },

    // Refund / Cancellation tracking
    cancelledAt: { type: Date },
    refundAmount: { type: Number },
    refundStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSED', 'FAILED'],
    },
    refundId: { type: String, sparse: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);




// Virtual: Is grace period active right now?
bookingSchema.virtual('isGraceRefundActive').get(function (this: IBooking) {
  return !!this.refundGracePeriodEnd && new Date() <= this.refundGracePeriodEnd;
});

// Virtual: Current refund percentage (example logic)
bookingSchema.virtual('currentRefundPercentage').get(function (this: IBooking) {
  if (this.bookingStatus !== BOOKING_STATUS.CONFIRMED) return 0;

  const now = new Date();
  const eventStart = this.eventRef.startDateTime; // assume populated or fetched separately

  // Normal policy example (customize as needed)
  let normalPercent = 0;
  const hoursToStart = (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursToStart > 48) normalPercent = 100;
  else if (hoursToStart > 0) normalPercent = 50;
  else normalPercent = 0;

  // Override with grace if active
  if (this.isGraceRefundActive) return 100;

  return normalPercent;
});

// Indexes
bookingSchema.index({ eventRef: 1, bookingStatus: 1 });           // Find confirmed bookings per event
bookingSchema.index({ userRef: 1, createdAt: -1 });               // User booking history
bookingSchema.index({ refundGracePeriodEnd: 1 });                 // Find grace-eligible bookings (if needed)

const Booking = model<IBooking>('Booking', bookingSchema);
export default Booking;
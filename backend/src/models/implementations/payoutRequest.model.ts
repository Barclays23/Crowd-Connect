// models/PayoutRequest.ts

import { Schema, model, Types } from 'mongoose';

export enum PAYOUT_STATUS {
  REQUESTED  = 'requested',   // Host clicked "Request Payout"
  APPROVED   = 'approved',    // Admin reviewed & approved
  REJECTED   = 'rejected',    // Admin denied (fraud, low attendance, policy violation)
  PROCESSED  = 'processed',   // Razorpay transfer succeeded
  FAILED     = 'failed',      // Transfer failed (e.g. invalid account, insufficient balance)
}

const payoutRequestSchema = new Schema({
   eventRef: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
   },
   hostRef: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
   },

   payoutStatus: {
      type: String,
      enum: Object.values(PAYOUT_STATUS),
      default: PAYOUT_STATUS.REQUESTED,
      required: true,
      index: true,  // Fast filtering for admin queue
   },

   // Proof / verification fields (your suggestion + QR-based trigger)
   attendancePercentage: {
      type: Number,   // e.g. 42% (In service: attendancePercentage: checkedInCount / soldTickets || 0)
      min: 0,
      max: 100,
      required: false,
   },
   proofImages: [{
      type: String,       // Cloudinary / S3 URLs
      required: false,
   }],
   proofNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
   },

   requestedAmount: {  // grossTicketRevenue from the event
      type: Number,
      required: true,
      min: 0,
   },

   commissionAmount: Number,    // admin commission
   platformFees: Number,        // 3rd party / Razorpay fee (from webhook or estimate)
   netPayoutAmount: Number,     // Final calculated payable amount (after commission, fees, refunds adjustment)

   transactionId: String,           // Razorpay transfer ID
   failureReason: String,           // If failed
   rejectionReason: String,         // If rejected by admin

   requestedAt: { type: Date, default: Date.now },
   approvedAt: Date,
   processedAt: Date,
   rejectedAt: Date,

}, {
   timestamps: true,
});




// Prevent duplicate active requests for same event+host
payoutRequestSchema.index(
   { eventRef: 1, hostRef: 1, payoutStatus: 1 },
   {
      unique: true,
      partialFilterExpression: {
         payoutStatus: { $in: [PAYOUT_STATUS.REQUESTED, PAYOUT_STATUS.APPROVED] }
      }
   }
);


//Also enforce in service layer (for better error messages and UX)
// const existing = await PayoutRequest.findOne({
//   event: eventId,
//   host: hostId,
//   status: { $in: ['requested', 'approved', 'processed'] }
// });
// If existing requested → return "Already requested"
// If existing processed → return "Already paid"
// If existing approved → return "Already approved/ under processing"
// If existing failed → allow retry
// If existing rejected → allow retry (maybe show previous rejection reason)





const PayoutRequest = model('PayoutRequest', payoutRequestSchema);
export default PayoutRequest;








// Simple flow:
// When the host opens the event detail/dashboard page:
// if event.status === EVENT_STATUS.PUBLISHED && new Date() > event.endDateTime
// Payout request only possible after endDateTime
// Make an API call to check if a payout request already exists for this event.
// GET /events/:id/payout-status or GET /payout-requests?eventId=:id&hostId=:currentUserId
// Response returns:
    //  - Whether a request exists
    //  - Current status (requested, approved, processed, etc.)
    //  - If exists and not in a final/retryable state → disable/hide the "Request Payout" button and show a status message like:
    //     "Payout already requested on [date]. Status: Processing"
    //     "Payout processed successfully on [date]. Funds should arrive soon."
    //  - Show status badges: "Payout Requested" (yellow), "Approved" (blue), "Processed" (green), etc.
    //  - If not requested already show button for PayoutRequest, 
    //  - Use simple state in UI (e.g., hasActivePayoutRequest boolean) to conditionally render the button.

//NEXT STEP (request)
// create payout request endpoint (POST /payout-requests or POST /events/:id/request-payout):
// prevent multiple clicks / requests
// Backend: 
// Always query first: PayoutRequest.findOne({ event: eventId, host: req.user.id })
// Check if any document exists with status not in a terminal state (e.g., not processed, failed, rejected permanently).
// Rules you can enforce:
        // If exists and status === 'requested' || 'approved' → return 409 Conflict / "Payout request already in progress"
        // If exists and status === 'processed' → return 403 / "Payout already completed for this event"
        // If exists and status === 'rejected' → allow retry (create new request) or show rejection reason + "Request again after fixing issue"
        // If exists and status === 'failed' → allow retry (common for transient bank issues)
// Use unique index in MongoDB for extra safety:
// payoutRequestSchema.index({ event: 1, host: 1, status: 1 }, { unique: true, partialFilterExpression: { status: { $in: ['requested', 'approved'] } } });

// Host requests → create PayoutRequest with status requested.
// calculate & store payoutAmount (soldTickets * ticketPrice - commission - fees).
// Create a PayoutRequest schema collection
// Admin sees queue (status: 'requested') → reviews → approve → trigger Razorpay transfer API.
// On webhook/success → update to processed.
// If success → set event.status = EVENT_STATUS.COMPLETED
// On failure → failed + retry option.
// On manual reject → rejected + notify host with reason.


// ADMIN VERIFICATION OF GENUINE EVENT
// QR-based attendance as primary signal (best objective metric):
// Track checkedInCount (increment on valid QR scan).
// If checkedInCount / soldTickets < 10–20% → require proof attachment.
// This is fairer than raw attendance % (no-shows don't hurt host if scanned).



// Once admin approves:
// import Razorpay from 'razorpay';

// const razorpay = new Razorpay({
//    key_id: process.env.RAZORPAY_KEY_ID,
//    key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// async function executePayout(payoutRequest: any) {
//    try {
//       const transfer = await razorpay.transfers.create({
//          account: payoutRequest.hostRazorpayAccountId,  // you need to store host's linked account or contact id
//          amount: Math.round(payoutRequest.netPayoutAmount * 100), // paise
//          currency: "INR",
//          notes: {
//          eventId: payoutRequest.eventRef.toString(),
//          payoutRequestId: payoutRequest._id.toString(),
//          },
//       });

//       payoutRequest.transferId = transfer.id;
//       payoutRequest.transferStatus = transfer.status; // "pending", "processed", etc.
//       payoutRequest.processedAt = new Date();
//       payoutRequest.payoutStatus = PAYOUT_STATUS.PROCESSED;
//       await payoutRequest.save();

//    } catch (err: any) {
//       payoutRequest.payoutStatus = PAYOUT_STATUS.FAILED;
//       payoutRequest.failureReason = err.description || err.message;
//       payoutRequest.failedAt = new Date();
//       await payoutRequest.save();
//       throw err;
//    }
// }
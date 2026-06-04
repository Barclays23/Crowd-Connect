// src/models/implementations/PayoutRequest.model.ts

import { IPayoutRequestModel, PAYOUT_REQUEST_STATUS } from '@/types/payout.types';
import { Schema, model, Types, Model } from 'mongoose';



const payoutRequestSchema = new Schema<IPayoutRequestModel>({
   eventRef: {
      type     : Types.ObjectId,
      ref      : 'Event',
      required : true,
   },
   hostRef: {
      type     : Types.ObjectId,
      ref      : 'User',
      required : true,
      index    : true,
   },

   eventTitle: { 
      type     : String, 
      required : true 
   },
   hostName: { 
      type     : String, 
      required : true 
   },
   ticketsSold: { 
      type     : Number, 
      required : true, 
      min      : 0 
   },
   checkedInCount: { 
      type     : Number, 
      required : true, 
      default  : 0, 
      min      : 0 
   },

   grossAmount: {       // grossTicketRevenue from the event
      type     : Number,
      required : true,
      min      : 0,
   },
   commissionRate: {     // why commissionRate & commissionAmount ??
      type     : Number,
      required : true,
      min      : 0,
      max      : 1,
   },
   commissionAmount: {   // admin commission
      type     : Number,
      required : true,
      min      : 0,
   },
   netAmount: {            // Final calculated payable amount (after commission, fees, refunds adjustment)
      type     : Number,
      required : true,
      min      : 0,
   },


   status: { 
      type     : String, 
      enum     : Object.values(PAYOUT_REQUEST_STATUS), 
      default  : PAYOUT_REQUEST_STATUS.PENDING,
      required : true,
      index    : true,  // Fast filtering for admin queue
   },
   requestedAt : { 
      type     : Date,
      default  : Date.now 
   },
   reviewedBy  : {         // admin who processed
      type   : Types.ObjectId, 
      ref    : "User" 
   },
   reviewedAt  : { 
      type   : Date 
   },
   rejectionReason: {    // If rejected by admin
      type  : String, 
      trim  : true 
   },
   notes : { 
      type  : String, 
      trim  : true 
   },
   proofUrls: { 
      type: [String], 
      default: [] 
   },

}, {
   timestamps: true,
   strict: "throw"
});




// Prevent duplicate active requests for same event
payoutRequestSchema.index(
   { eventRef: 1 },
   { 
      unique: true, 
      partialFilterExpression: { 
         status: { $in: [
            PAYOUT_REQUEST_STATUS.PENDING, 
            PAYOUT_REQUEST_STATUS.APPROVED, 
            PAYOUT_REQUEST_STATUS.PAID
         ] } 
      } 
   }
);


export const PayoutRequestModel: Model<IPayoutRequestModel> = model<IPayoutRequestModel>("PayoutRequest", payoutRequestSchema);



// If existing rejected → allow retry (maybe show previous rejection reason)




// Simple flow:
// When the host opens the event detail/dashboard page:
// if event.status === EVENT_STATUS.PUBLISHED && new Date() > event.endDateTime
// Payout request only possible after endDateTime
// Make an API call to check if a payout request already exists for this event.
// If exists and status === 'rejected' → allow retry (create new request) or show rejection reason + "Request again after fixing issue"
// how marking the event status = 'COMPLETED' (check it), need to do with cron job?? or when host/admin opens the my-events / events list ??

// ADMIN VERIFICATION OF GENUINE EVENT
// QR-based attendance as primary signal (best objective metric):
// Track checkedInCount (increment on valid QR scan).
// If checkedInCount / soldTickets < 10–20% → require proof attachment.
// This is fairer than raw attendance % (no-shows don't hurt host if scanned).
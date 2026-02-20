// src/models/implementations/event.model.ts

import { ALL_EVENT_CATEGORIES, EVENT_FORMAT, EVENT_STATUS, IEventModel, TICKET_TYPE } from "@/types/event.types";
import { model, Model, Schema, HydratedDocument } from "mongoose";



// export interface IEventModel extends Document { }



const eventSchema = new Schema<IEventModel>(
   {
      hostRef: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },

      title: {
         type: String,
         required: true,
         trim: true,
      },
      category: {
         type: String,
         required: true,
         enum: ALL_EVENT_CATEGORIES,
      },
      description: {
         type: String,
         required: true
      },

      posterUrl: {
         type: String, // Store the Cloudinary/S3 URL here
         required: false,  // should be able to create event without poster first (especially manual upload).
      },

      // --- Event Format (Online vs In-Person) ---
      format: {
         type: String,
         enum: Object.values(EVENT_FORMAT),
         required: true,
      },
      // --- Location (Hybrid Approach) ---
      locationName: {   // The human-readable name (e.g. "Bangalore, Karnataka")
         type: String,
         trim: true,
      },
      location: {      // GeoJSON for Map Searches (Radius filters)
         type: {
            type: String,
            enum: ["Point"],
            default: "Point",
         },
         coordinates: {
            type: [Number], // [Longitude, Latitude]
         },
      },
      onlineLink: {      // Only valid if format is online
         type: String,
         trim: true,
         // required: function() { return this.format === EVENT_FORMAT.ONLINE },
         required: [function() { return this.format === 'online'; }, 'Online events require a link'],
      },

      // --- Date & Time ---
      startDateTime: {
         type: Date,
         required: true,
      },
      endDateTime: {
         type: Date,
         required: true
      },

      // --- Ticket Type & Pricing ---
      ticketType: {
         type: String,
         enum: Object.values(TICKET_TYPE),
         required: true,
      },
      ticketPrice: {
         type: Number,
         default: 0,
         min: 0,
      },
      capacity: {         // Prevent editing (decreasing) capacity below soldTickets.
         type: Number,
         required: true,
         min: 1
      },
      soldTickets: {
         type: Number,
         default: 0,
         min: 0,
      },
      checkedInCount: {    // number of QR scanned or attendedance for the event (used for attendance percentage calculation for payout process)
         type: Number,
         default: 0,
         min: 0,
      },
      grossTicketRevenue: {  // best for calculating early bird ticket price system, price may change, not always same.
         type: Number,       // This value changes dynamically during the event lifecycle (every new booking / cancellation)
         default: 0,
         min: 0,
      },
      
      // --- Management Fields ---
      eventStatus: {
         type: String,
         enum: Object.values(EVENT_STATUS),
         default: EVENT_STATUS.DRAFT,
         required: true
      },
      views: {
         type: Number,
         default: 0,
         min: 0,
      },

      // --- Event Cancellation ---
      cancellation: {
         reason: {
            type: String,
            trim: true,
         },
         cancelledBy: {
            type: String,
            enum: ["ADMIN", "HOST"],
         },
         cancelledAt: {
            type: Date,
         },
      },

   },
   {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
   }
);



// Virtual: Automatically calculate 'ticketsLeft'
// eventSchema.virtual('ticketsLeft').get(function() {
//   return this.capacity - this.soldTickets;
// });
// "ticketsLeft": 80 // <--- This was added automatically!




// --- INDEXES ---

eventSchema.index({ location: "2dsphere" });                // Geospatial Index: Allows us to find events "Near Me"
eventSchema.index({ title: "text", description: "text" });  // Text Search Index: Allows searching by Title or Description
eventSchema.index({ category: 1 });                         // Filters & sorting
eventSchema.index({ startDateTime: 1 });                    // For sorting by date
eventSchema.index({ hostRef: 1 });                          // For finding events by a specific host (eg: my events)

// Compound index
eventSchema.index({ eventStatus: 1, startDateTime: 1 });    // filter by eventStatus AND sort by startDateTime.






// --- PRE-SAVE HOOKS ---
eventSchema.pre('save', async function (this: HydratedDocument<IEventModel>, next) {
   // Capacity validation
   if (this.isModified('capacity') && this.capacity < this.soldTickets) {
      throw new Error('Cannot reduce capacity below current sold tickets');
   }

   // ticketType & ticketPrice validation
   if (this.ticketType === TICKET_TYPE.FREE && this.ticketPrice > 0) {
      throw new Error("Free events cannot have price > 0");
   }
   if (this.ticketType === TICKET_TYPE.PAID && this.ticketPrice <= 0) {
      throw new Error("Paid events must have ticket price > 0");
   }

   // No need to call next() — Mongoose handles it automatically in async middleware
});





const Event: Model<IEventModel> = model<IEventModel>("Event", eventSchema);
export default Event;





// in UI, the ticketPrice readOnly when free — good, but ensure backend rejects price > 0 for free events.
// use the pre-save hook or business logic in service layer or in zod validation?




// On new confirmed booking
// await Event.findByIdAndUpdate(booking.eventId, {
//    $inc: {
//       soldTickets: booking.quantity,                       // single booking may have multiple tickets/quantity
//       grossTicketRevenue: booking.ticketRate * booking.quantity,  // + (price × 4)
//    }
// });

// On cancellation (refunded)
// await Event.findByIdAndUpdate(booking.eventId, {
//    $inc: {
//       soldTickets: -booking.quantity,                         // single booking may have multiple tickets/quantity
//       grossTicketRevenue: -(booking.ticketRate * booking.quantity),  // - (price × 4)
//    }
// });
// Never use ticketPrice from the request body directly in these updates
// → Always fetch ticketPrice from the Event document itself (prevents manipulation).



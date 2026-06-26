// frontend/src/constants/event.constants.ts

export const EVENT_CATEGORIES = [
   "Art & Exhibitions",
   "Business & Networking",
   "Charity & Causes",
   "Conferences & Seminars",
   "Education & Workshops",
   "Fashion & Beauty",
   "Festivals & Fairs",
   "Film & Media",
   "Food & Drink",
   "Health & Wellness",
   "Kids & Family",
   "Music & Concerts",
   "Parties & Nightlife",
   "Spiritual & Religious",
   "Sports & Fitness",
   "Technology & Innovation",
   "Theatre & Live Shows",
   "Travel & Outdoor",
   "Weddings & Social Gatherings",
] as const;



export const EVENT_STATUSES = {
  DRAFT : "draft",             // DRAFT: Creating / Editing phase.
  PUBLISHED : "published",     // PUBLISHED: Live and bookable ("published" is only stored in DB, not exposing to frontend)
  CANCELLED : "cancelled",     // CANCELLED: Permanent stop.
  SUSPENDED : "suspended",     // SUSPENDED: admin suspended. (but reason in cancelledReason)
  COMPLETED : "completed",     // COMPLETED: Auto or manual (after end / payouts). After every process completed.

  // Only for virtual UI display based on startDateTime & endDateTime
  UPCOMING   : "upcoming",     // Virtual UI status (from backend getEventDisplayStatus) — derived from startDateTime
  ONGOING    : "ongoing",      // Virtual UI status (from backend getEventDisplayStatus) — derived from start/endDateTime
}

export const EVENT_FORMATS = {
  OFFLINE: "offline",
  ONLINE: "online"
} as const;



// move to ticket.constants ?? 
export const TICKET_TYPES = {
  FREE: "free",
  PAID: "paid"
} as const;





export type EventFormat  = typeof EVENT_FORMATS[keyof typeof EVENT_FORMATS];
export type TicketType   = typeof TICKET_TYPES[keyof typeof TICKET_TYPES];
export type EventStatus  = typeof EVENT_STATUSES[keyof typeof EVENT_STATUSES];
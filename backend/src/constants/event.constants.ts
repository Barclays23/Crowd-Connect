// backend/src/constants/event.constants.ts

export const ALL_EVENT_CATEGORIES = [
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

export type EventCategory = typeof ALL_EVENT_CATEGORIES[number];


export const EVENT_FORMATS = {
  ONLINE : 'online',
  OFFLINE : 'offline',
}
export type EventFormat   = typeof EVENT_FORMATS[keyof typeof EVENT_FORMATS];



export const EVENT_STATUSES = {
  DRAFT : "draft",             // DRAFT: Creating / Editing phase.
  PUBLISHED : "published",     // PUBLISHED: Live and bookable. and cannot change back to draft (time-based display computed from here).
  CANCELLED : "cancelled",     // CANCELLED: Permanent stop.
  SUSPENDED : "suspended",     // SUSPENDED: admin suspended. (but reason in cancelledReason)
  COMPLETED : "completed",     // COMPLETED: Auto or manual (after end / payouts). After every process completed.

  // Onlu for virtual UI display based on startDateTime & endDateTime
  // use getEventDisplayStatus to generate the display event status.
  UPCOMING : "upcoming",
  ONGOING  : "ongoing",
}
export type EventStatus   = typeof EVENT_STATUSES[keyof typeof EVENT_STATUSES];





export const EVENT_CHANGE_TYPES = {
    START_DATE_TIME : 'START_DATE_TIME',
    END_DATE_TIME   : 'END_DATE_TIME',
    VENUE           : 'VENUE',
    LOCATION        : 'LOCATION',
    TICKET_PRICE    : 'TICKET_PRICE',
    CAPACITY        : 'CAPACITY',
    MULTIPLE        : 'MULTIPLE',
    // FORMAT          : 'FORMAT',
    // ↑ Removed FORMAT — format change switch is BLOCKED entirely, it is not grace-period eligible.
    // bcoz: if once anyone booked the event, cannot switch format (ONLINE/OFFLINE).
    // and also it will affect the number of tickets booked per user 
    // eg: if user booked 4 tickets for OFFLINE events and when changing to ONLINE as only ticket allowed for ONLINE events)
} as const;
export type EventChangeType = typeof EVENT_CHANGE_TYPES[keyof typeof EVENT_CHANGE_TYPES];





// move to ticket constants??
export const TICKET_TYPES = {
  FREE : 'free',
  PAID : 'paid',
}
export type TicketType   = typeof TICKET_TYPES[keyof typeof TICKET_TYPES];


// move to any other constants???
export const DEFAULT_RADIUS_KM = 25
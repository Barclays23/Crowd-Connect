// frontent/src/types/event.types.ts

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




export const EVENT_FORMAT = ["offline", "online"] as const;
export const TICKET_TYPE = ["free", "paid"] as const;



// Based on your plan (5-10%)
// Also check the same percentage value in backend
export const ADMIN_COMMISSION_PERCENT = 10;


export const POSTER_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const POSTER_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
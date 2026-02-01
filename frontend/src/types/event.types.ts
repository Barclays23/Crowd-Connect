// frontent/src/types/event.types.ts

export const EVENT_CATEGORIES = [
   "Music & Concerts",
   "Theatre & Arts",
   "Food & Drink",
   "Sports & Fitness",
   "Health & Wellness",
   "Business & Networking",
   "Technology & Innovation",
   "Education & Workshops",
   "Parties & Nightlife",
   "Film & Media",
   "Weddings & Social Gatherings",
   "Festivals & Fairs",
   "Fashion & Beauty",
   "Travel & Outdoor",
   "Spiritual & Religious",
   "Charity & Causes",
   "Kids & Family",
] as const;



export const EVENT_FORMAT = ["offline", "online"] as const;
export const TICKET_TYPE = ["free", "paid"] as const;



// Based on your plan (5-10%)
// Also check the same percentage value in backend
export const ADMIN_COMMISSION_PERCENT = 10;


export const POSTER_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const POSTER_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
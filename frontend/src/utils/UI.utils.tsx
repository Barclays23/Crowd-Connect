// frontend/src/utils/UI.utils.tsx

import type { EVENT_STATUS, IEventState } from "@/types/event.types";
import { BOOKING_STATUS, PAYMENT_STATUS } from "@/types/booking.types";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { SiZoho, SiIcloud } from 'react-icons/si'




export type BadgeVariant = 
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "destructive"
  | "info"
  | "warning"
  | "accent"
  | "outline"
  | "muted"
  | "highlight"
  | "subtle"
  | "brand"
  | "neutral"
  | "inverse"
  | "gradient"
  | null
  | undefined;

  
// ─── User UI helpers ────────────────────────────────────────────────────

export const getUserStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "active": return "success";
    case "blocked": return "destructive";
    case "pending": return "outline";
    default: return "secondary";
  }
};



// ─── Event UI helpers ────────────────────────────────────────────────────

export const getEventStatusBadgeVariant = (
  status: EVENT_STATUS
) => {
  switch (status) {
    case "draft":
      return "secondary";

    case "upcoming":
      return "default";

    case "ongoing":
      return "success";

    case "completed":
      return "outline";

    case "cancelled":
      return "destructive";

    case "suspended":
      return "warning";

    default:
      return "secondary";
  }
};


const eventCategoryVariantMap: Record<string, BadgeVariant> = {
  "Art & Exhibitions": "accent",
  "Fashion & Beauty": "accent",
  "Film & Media": "accent",
  "Theatre & Live Shows": "accent",
  "Music & Concerts": "accent",

  "Business & Networking": "info",
  "Conferences & Seminars": "info",
  "Technology & Innovation": "info",

  "Education & Workshops": "default",
  "Kids & Family": "default",

  "Health & Wellness": "success",
  "Spiritual & Religious": "success",
  "Charity & Causes": "success",

  "Food & Drink": "warning",
  "Festivals & Fairs": "warning",
  "Parties & Nightlife": "warning",

  "Sports & Fitness": "secondary",
  "Travel & Outdoor": "secondary",

  "Weddings & Social Gatherings": "highlight",
};


export const getEventCategoryBadgeVariant = (category: string): BadgeVariant => {
  if (!category?.trim()) {
    return "secondary";
  }

  const normalized = category.trim();

  // Look up exact match (case-sensitive)
  return eventCategoryVariantMap[normalized] ?? "secondary";
};



export function getSeatsInfo(event: IEventState) {
  if (!event.capacity) return null;
  const sold      = event.soldTickets ?? 0;
  const remaining = event.capacity - sold;
  const percentage = (sold / event.capacity) * 100;
  return { remaining, sold, capacity: event.capacity, percentage: Math.min(percentage, 100) };
}



// ─── Booking UI helpers ────────────────────────────────────────────────────

export function getBookingStatusVariant(
  status: BOOKING_STATUS
): BadgeVariant {
  switch (status) {
    case BOOKING_STATUS.CONFIRMED: return "success";    // green — booking is active
    case BOOKING_STATUS.ATTENDED:  return "brand";       // blue — past but positive
    case BOOKING_STATUS.PENDING:   return "warning";    // amber — waiting/uncertain
    case BOOKING_STATUS.CANCELLED: return "info";    // gray — inactive, not an error
    case BOOKING_STATUS.FAILED:    return "destructive"; // red — something went wrong
    default:                       return "muted";
  }
}


export function getBookingStatusIcon(status: BOOKING_STATUS) {
  switch (status) {
    case BOOKING_STATUS.CONFIRMED: return <CheckCircle className="h-4 w-4" />;
    case BOOKING_STATUS.ATTENDED:  return <CheckCircle className="h-4 w-4" />;
    case BOOKING_STATUS.PENDING:   return <Clock       className="h-4 w-4" />;
    case BOOKING_STATUS.CANCELLED: return <XCircle     className="h-4 w-4" />;
    case BOOKING_STATUS.FAILED:    return <AlertCircle className="h-4 w-4" />;
    default:                       return null;
  }
}



// ─── Payment UI helpers ────────────────────────────────────────────────────

export function getPaymentStatusVariant(
  status: PAYMENT_STATUS
): "default" | "secondary" | "destructive" | "outline" | "success" {
  switch (status) {
    case PAYMENT_STATUS.COMPLETED:     return "success";
    case PAYMENT_STATUS.REFUNDED: return "secondary";
    case PAYMENT_STATUS.PENDING:  return "outline";
    case PAYMENT_STATUS.FAILED:   return "destructive";
    default:                      return "outline";
  }
}




// ── Email providers ─────────────────────────────────────────────────────────
export const EMAIL_PROVIDERS = [
  {
    name: 'Gmail',
    url: 'https://mail.google.com',
    bg: 'hover:bg-red-50 dark:hover:bg-red-950/30',
    border: 'hover:border-red-200 dark:hover:border-red-800',
    icon: <img src="/icons/gmail.png" className="w-5 h-5 shrink-0" alt="Gmail" />,
  },
  {
    name: 'Outlook',
    url: 'https://outlook.live.com',
    bg: 'hover:bg-blue-50 dark:hover:bg-blue-950/30',
    border: 'hover:border-blue-200 dark:hover:border-blue-800',
    icon: <img src="/icons/outlook2.png" className="w-5 h-5 shrink-0" alt="Outlook" />,
  },
  {
    name: 'Yahoo',
    url: 'https://mail.yahoo.com',
    bg: 'hover:bg-purple-50 dark:hover:bg-purple-950/30',
    border: 'hover:border-purple-200 dark:hover:border-purple-800',
    icon: <img src="/icons/yahoo2.png" className="w-5 h-5 shrink-0" alt="Yahoo" />,
  },
  {
    name: 'Zoho',
    url: 'https://mail.zoho.com',
    bg: 'hover:bg-orange-50 dark:hover:bg-orange-950/30',
    border: 'hover:border-orange-200 dark:hover:border-orange-800',
    // icon: <SiZoho className="w-5 h-5 shrink-0 text-[#E42527]" />,
    icon: <img src="/icons/zoho.png" className="w-5 h-5 shrink-0" alt="Zoho" />,
  },
  {
    name: 'iCloud',
    url: 'https://www.icloud.com/mail',
    bg: 'hover:bg-sky-50 dark:hover:bg-sky-950/30',
    border: 'hover:border-sky-200 dark:hover:border-sky-800',
    icon: <SiIcloud className="w-5 h-5 shrink-0 text-[#3898FF]" />,
  },
]
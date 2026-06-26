// frontend/src/utils/UI.utils.tsx

import { BOOKING_STATUS, type BookingStatus } from "@/constants/booking.constants";
import type { EventStatus } from "@/constants/event.constants";
import { PAYMENT_STATUSES, type PaymentStatus } from "@/constants/payment.constants";
import { TRANSACTION_DIRECTION, TRANSACTION_STATUS, TRANSACTION_TYPE, type TransactionDirection, type TransactionStatus, type TransactionType } from "@/constants/transaction.constants";
import type { IEventState } from "@/types/event.types";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { SiIcloud } from 'react-icons/si'





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
  status: EventStatus
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
  status: BookingStatus
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


export function getBookingStatusIcon(status: BookingStatus) {
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
  status: PaymentStatus
): "default" | "secondary" | "destructive" | "outline" | "success" {
  switch (status) {
    case PAYMENT_STATUSES.COMPLETED:     return "success";
    case PAYMENT_STATUSES.REFUNDED: return "secondary";
    case PAYMENT_STATUSES.PENDING:  return "outline";
    case PAYMENT_STATUSES.FAILED:   return "destructive";
    default:                      return "outline";
  }
}






// ─── Wallet & Transaction UI helpers ────────────────────────────────────────────────────
export function getTransactionStatusVariant (status: TransactionStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case TRANSACTION_STATUS.COMPLETED: return "default";
    case TRANSACTION_STATUS.PENDING:   return "secondary";
    case TRANSACTION_STATUS.FAILED:    return "destructive";
    default:                           return "outline";
  }
}


export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TRANSACTION_TYPE.BOOKING_REFUND]  : "Booking refund",
  [TRANSACTION_TYPE.CASHBACK]        : "Cashback",
  [TRANSACTION_TYPE.REFERRAL_CREDIT] : "Referral credit",
  [TRANSACTION_TYPE.HOST_PAYOUT]     : "Host payout",
  [TRANSACTION_TYPE.WALLET_PAYMENT]  : "Wallet payment",
  [TRANSACTION_TYPE.WITHDRAWAL]      : "Withdrawal",
};


export function formatTransactionAmount(amount: number, direction: TransactionDirection): string {
  const prefix = direction === TRANSACTION_DIRECTION.CREDIT ? "+ " : "− ";
  return `${prefix}₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}



// converts the number into the Indian number format.
// eg: 12345678 to ₹1,23,45,678
export function formatNumberToINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// eg: 12345 to ₹12345.00
export function formatNumberToINRWithDecimal(amount: number) {
  return `₹${amount.toFixed(2)}`;
}



// ── Email providers ─────────────────────────────────────────────────────────
export const EMAIL_PROVIDERS = [
  {
    name: 'Gmail',
    url: 'https://mail.google.com',
    icon: <img src="/icons/gmail.png" className="w-5 h-5 shrink-0" alt="Gmail" />,
  },
  {
    name: 'Outlook',
    url: 'https://outlook.live.com',
    icon: <img src="/icons/outlook2.png" className="w-5 h-5 shrink-0" alt="Outlook" />,
  },
  {
    name: 'Yahoo',
    url: 'https://mail.yahoo.com',
    icon: <img src="/icons/yahoo2.png" className="w-5 h-5 shrink-0" alt="Yahoo" />,
  },
  {
    name: 'Zoho',
    url: 'https://mail.zoho.com',
    // icon: <SiZoho className="w-5 h-5 shrink-0 text-[#E42527]" />,
    icon: <img src="/icons/zoho.png" className="w-5 h-5 shrink-0" alt="Zoho" />,
  },
  {
    name: 'iCloud',
    url: 'https://www.icloud.com/mail',
    icon: <SiIcloud className="w-5 h-5 shrink-0 text-[#3898FF]" />,
  },
]
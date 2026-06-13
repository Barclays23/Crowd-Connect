// frontend/src/types/payout.types.ts

import type { IPagination } from "@/types/common.types";


export const PAYOUT_REQUEST_STATUSES = {
  PENDING   : "pending",
  APPROVED  : "approved",
  REJECTED  : "rejected",
  PAID      : "paid",
} as const;


export type PayoutRequestStatus = typeof PAYOUT_REQUEST_STATUSES[keyof typeof PAYOUT_REQUEST_STATUSES];

export type PayoutSortField = "requestedAt" | "grossAmount" | "netAmount" | "status";
export type PayoutSortDirection = "asc" | "desc";


export interface IPayoutRequest {
   payoutId       : string;
   eventId        : string;
   eventTitle     : string;
   hostId         : string;
   hostName       : string;

   grossAmount    : number;       // Total ticket revenue for the event
   commissionRate : number;       // e.g. 0.10 for 10%
   commissionAmount: number;      // grossAmount * commissionRate
   netAmount      : number;       // grossAmount - commissionAmount (credited to host wallet)
   ticketsSold    : number;
   checkedInCount : number;

   status         : PayoutRequestStatus;
   requestedAt    : string;
   reviewedBy?    : string;       // Admin who reviewed
   reviewedAt?    : string;
   rejectionReason?: string;

   proofUrls?     : string[];
}

export interface IPayoutEligibleEvent {
   eventId        : string;
   title          : string;
   endDateTime    : string;
   grossTicketRevenue: number;
   soldTickets    : number;
   checkedInCount : number;
   
   payoutRequested: boolean;
   payoutStatus?  : PayoutRequestStatus;
   previousRejectionReason?: string;
   canReapply?    : boolean;
}

export interface GetPayoutsApiResponse {
   payouts      : IPayoutRequest[];
   pagination   : IPagination
}

export interface GetEligibleEventsApiResponse {
  commissionRate        : number;
  minAttendancePercent  : number;
  events                : IPayoutEligibleEvent[];
}


export interface RequestPayoutBody {
   eventId     : string;
   proofUrls?  : string[];
}

export interface ReviewPayoutBody {
   action          : "approve" | "reject";
   rejectionReason?: string;
}
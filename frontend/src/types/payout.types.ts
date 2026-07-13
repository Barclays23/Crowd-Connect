// frontend/src/types/payout.types.ts


// move to constants
export const PAYOUT_REQUEST_STATUSES = {
  PENDING   : "pending",
  APPROVED  : "approved",  // only need if using payment gateways/webhooks
  REJECTED  : "rejected",
  PAID      : "paid",
} as const;


export type PayoutRequestStatus = typeof PAYOUT_REQUEST_STATUSES[keyof typeof PAYOUT_REQUEST_STATUSES];

export type PayoutSortField = "requestedAt" | "grossAmount" | "netAmount" | "status";
export type PayoutSortDirection = "asc" | "desc";



export interface IPayoutState {
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




// ─── REQUEST PAYLOADS ─────────────────────────────────────────────────────────

export interface GetPayoutsQueryParams {
   page?: number;
   limit?: number;
   sortBy?: PayoutSortField;
   sortOrder?: PayoutSortDirection;
   status?: string;
   search?: string;
}


export interface ReviewPayoutPayload {
   action: "approve" | "reject";
   rejectionReason?: string;
}





// ─── RESPONSE DATA PAYLOADS (The 'T' in ApiResponse<T>) ────────────────────────────────

export interface EligibleEventsData {
  commissionRate       : number;
  minAttendancePercent : number;
  events               : IPayoutEligibleEvent[];
}







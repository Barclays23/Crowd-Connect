// backend/src/dtos/payout.dto.ts

import { PayoutRequestStatus } from "@/constants/payout.constants";
import { IPagination } from "@/types/common.types";





export interface PayoutResponseDTO {
  payoutId         : string;
  eventId          : string;
  hostId           : string;
  // eventRef         : { _id: string; title: string };
  // hostRef          : { _id: string; name: string; email: string };

  eventTitle       : string;
  hostName         : string;
  
  grossAmount      : number;
  commissionRate   : number;
  commissionAmount : number;
  netAmount        : number;
  ticketsSold      : number;
  checkedInCount   : number;

  status           : PayoutRequestStatus;
  requestedAt      : string;
  reviewedAt      ?: string;
  reviewedBy      ?: string;
  rejectionReason ?: string;
  notes           ?: string;

  proofUrls        : string[];

  createdAt        : string;
}



export interface EligibleEventDTO {
  eventId           : string;
  title             : string;
  endDateTime       : string | Date;
  grossTicketRevenue: number;
  soldTickets       : number;
  ticketPrice       : number;
  checkedInCount    : number;
  payoutRequested   : boolean;
  payoutStatus     ?: string;
  previousRejectionReason?: string;
  canReapply?       : boolean;
}


export interface GetPayoutsResponse {
  payouts    : PayoutResponseDTO[];
  pagination : IPagination;
}


export interface GetEligibleEventsResponse {
  commissionRate        : number;
  minAttendancePercent  : number;
  events                : EligibleEventDTO[];
}
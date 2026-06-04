// backend/src/dtos/payout.dto.ts

import { IPagination } from "@/types/common.types";
import { PAYOUT_REQUEST_STATUS } from "@/types/payout.types";





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

  status           : PAYOUT_REQUEST_STATUS;
  requestedAt      : string;
  reviewedAt      ?: string;
  reviewedBy      ?: string;
  rejectionReason ?: string;
  notes           ?: string;

  createdAt        : string;
}



export interface EligibleEventDTO {
  eventId           : string;
  title             : string;
  endDateTime       : string | Date;
  grossTicketRevenue: number;
  soldTickets       : number;
  ticketPrice       : number;
  payoutRequested   : boolean;
  payoutStatus     ?: string;
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
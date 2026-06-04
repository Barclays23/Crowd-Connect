// backend/src/entities/payout.entity.ts

import { PAYOUT_REQUEST_STATUS } from "@/types/payout.types";


export interface PayoutEntity {
    payoutId        : string,
    eventId         : string,
    hostId          : string,

    eventTitle      : string,
    hostName        : string,
    
    ticketsSold     : number,
    checkedInCount  : number,

    grossAmount     : number,
    commissionRate  : number,
    commissionAmount: number,
    netAmount       : number,
    
    status          : PAYOUT_REQUEST_STATUS,
    requestedAt     : string,
    reviewedAt?     : string,
    reviewedBy?     : string,
    rejectionReason?: string,
    notes?          : string,
    proofUrls       : string[];

    createdAt       : string,
    updatedAt?      : string
}
// backend/src/entities/payout.entity.ts

import { PayoutRequestStatus } from "@/constants/payout.constants";


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
    
    status          : PayoutRequestStatus,
    requestedAt     : string,
    reviewedAt?     : string,
    reviewedBy?     : string,
    rejectionReason?: string,
    notes?          : string,
    proofUrls       : string[];

    createdAt       : string,
    updatedAt?      : string
}
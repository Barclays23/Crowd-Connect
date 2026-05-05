
// backend/src/services/payout-services/interfaces/IPayoutService.ts

import {
   GetPayoutRequestsResponse,
   PayoutRequestResponseDTO,
} from "@/dtos/wallet.dto";

import { 
   CreatePayoutRequestInput, 
   GetPayoutRequestsFilter, 
   ReviewPayoutRequestInput 
} from "@/types/payout.types";




export interface IPayoutService {

   // ─── Payout Requests (Host → Admin → Host Wallet) ────────────────────────────
   createPayoutRequest(input: CreatePayoutRequestInput): Promise<PayoutRequestResponseDTO>;

   reviewPayoutRequest(input: ReviewPayoutRequestInput): Promise<PayoutRequestResponseDTO>;

   getPayoutRequests(filters: GetPayoutRequestsFilter): Promise<GetPayoutRequestsResponse>;

   getMyPayoutRequests(hostId: string, filters: GetPayoutRequestsFilter): Promise<GetPayoutRequestsResponse>;

}
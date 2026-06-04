
// backend/src/services/payout-services/interfaces/IPayoutService.ts
import { 
   GetEligibleEventsResponse,
   GetPayoutsResponse, 
   PayoutResponseDTO 
} from "@/dtos/payout.dto";
import { 
   GetPayoutsFilter,
   ReviewPayoutInput, 
} from "@/types/payout.types";




export interface IPayoutService {
   // host submits the payout request
   requestPayout(hostId: string, eventId: string, proofFiles?: Express.Multer.File[]): Promise<PayoutResponseDTO>;

   // admin approve or reject the payout request
   reviewPayout(adminId: string, payoutId: string, payoutInput: ReviewPayoutInput): Promise<PayoutResponseDTO>;

   // for host
   getMyPayouts(hostId: string, filters: GetPayoutsFilter): Promise<GetPayoutsResponse>;
   
   // for admin
   getAllPayouts(filters: GetPayoutsFilter): Promise<GetPayoutsResponse>;

   getEligibleEvents(hostId: string): Promise<GetEligibleEventsResponse>;

}
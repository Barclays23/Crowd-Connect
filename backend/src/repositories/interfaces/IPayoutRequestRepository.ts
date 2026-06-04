// backend/src/repositories/interfaces/IPayoutRepository.ts

import { PayoutEntity } from "@/entities/payout.entity";
import { 
  CreatePayoutInput, 
  GetPayoutsFilter, 
  UpdatePayoutInput 
} from "@/types/payout.types";
import { ClientSession } from "mongoose";




export interface IPayoutRepository {

  createPayout(createPayoutInput: CreatePayoutInput, options?: { session: ClientSession }): Promise<PayoutEntity>;

  findPayoutById(payoutId: string): Promise<PayoutEntity | null>;

  // to check if existing payout for an event
  findPayoutByEventId(eventId: string): Promise<PayoutEntity | null>;

  findPayoutByEventIds(eventIds: string[]): Promise<PayoutEntity[]>;

  findPayouts(filters: GetPayoutsFilter): Promise<PayoutEntity[]>;
  
  countPayouts(filters: GetPayoutsFilter): Promise<number>;

  updatePayout(payoutId: string, updateData: UpdatePayoutInput, options?: { session: ClientSession }): Promise<PayoutEntity | null>;

}
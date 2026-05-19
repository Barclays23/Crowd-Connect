// backend/src/repositories/interfaces/IWithdrawalRequestRepository.ts


import { Types } from "mongoose";
import { 
  IWithdrawalRequestModel, 
  GetWithdrawalRequestsFilter, 
  WITHDRAWAL_STATUS 
} from "@/types/wallet.types";




export interface IWithdrawalRequestRepository {
  create(data: Omit<IWithdrawalRequestModel, "_id" | "createdAt" | "updatedAt">): Promise<IWithdrawalRequestModel>;
  findById(id: string): Promise<IWithdrawalRequestModel | null>;
  findByRazorpayPayoutId(razorpayPayoutId: string): Promise<IWithdrawalRequestModel | null>;  // for webhook lookup
  findByHostId(hostId: string | Types.ObjectId, filters: GetWithdrawalRequestsFilter): Promise<{ withdrawalRequests: IWithdrawalRequestModel[]; total: number }>;
  updateStatus(id: string, status: WITHDRAWAL_STATUS, extras?: Partial<IWithdrawalRequestModel>): Promise<IWithdrawalRequestModel | null>;
}
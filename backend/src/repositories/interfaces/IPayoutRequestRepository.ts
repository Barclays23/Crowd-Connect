// // backend/src/repositories/interfaces/IPayoutRequestRepository.ts

// import { Types } from "mongoose";
// import { IPayoutRequestModel, GetPayoutRequestsFilter, PAYOUT_REQUEST_STATUS } from "@/types/wallet.types";




// export interface IPayoutRequestRepository {
//   createPayoutRequest(data: Omit<IPayoutRequestModel, "_id" | "createdAt" | "updatedAt">): Promise<IPayoutRequestModel>;
//   findById(id: string): Promise<IPayoutRequestModel | null>;
//   findByEventId(eventId: string | Types.ObjectId): Promise<IPayoutRequestModel | null>;   // prevent duplicate payout requests
//   findAll(filters: GetPayoutRequestsFilter): Promise<{ payoutRequests: IPayoutRequestModel[]; total: number }>;
//   findByHostId(hostId: string | Types.ObjectId, filters: GetPayoutRequestsFilter): Promise<{ payoutRequests: IPayoutRequestModel[]; total: number }>;
//   updateStatus(id: string, status: PAYOUT_REQUEST_STATUS, reviewedBy?: string | Types.ObjectId, extras?: Partial<IPayoutRequestModel>): Promise<IPayoutRequestModel | null>;
// }
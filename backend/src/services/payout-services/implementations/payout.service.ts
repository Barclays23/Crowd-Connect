// // backend/src/services/payout-services/implementations/payout.service.ts
// import { IPayoutService } from "../interfaces/IPayoutService";
// import { IPayoutRequestRepository } from "@/repositories/interfaces/IPayoutRequestRepository";
// import { IWalletService } from "@/services/wallet-services/interfaces/IWalletService";
// import { IUserRepository } from "@/repositories/interfaces/IUserRepository";
// import { TRANSACTION_TYPE, TRANSACTION_REFERENCE_TYPE } from "@/types/wallet.types";
// import { createHttpError } from "@/utils/httpError.utils";
// import { HttpStatus } from "@/constants/statusCodes.constants";
// import { 
//     GetPayoutRequestsResponse, 
//     PayoutRequestResponseDTO 
// } from "@/dtos/wallet.dto";
// import { 
//     CreatePayoutRequestInput, 
//     ReviewPayoutRequestInput,
//     GetPayoutRequestsFilter, 
//     PAYOUT_REQUEST_STATUS, 
// } from "@/types/payout.types";
// import { IPlatformSettingsService } from "@/services/platform-settings-services/interfaces/IPlatformSettingsService";





// export class PayoutService implements IPayoutService {
//     constructor(
//         private readonly _payoutRepository: IPayoutRequestRepository,
//         private readonly _walletService: IWalletService,
//         private readonly _userRepository: IUserRepository,
//         private readonly _settingsService: IPlatformSettingsService,
//     ) {}


//     async createPayoutRequest(input: CreatePayoutRequestInput): Promise<PayoutRequestResponseDTO> {
//         // Logic: Validate event is completed, ensure payout isn't already requested, calculate 5-10% commission, save to DB.
//         throw new Error("Not implemented");
//     }


//     async reviewPayoutRequest(input: ReviewPayoutRequestInput): Promise<PayoutRequestResponseDTO> {
//         const session = await this._payoutRepository.startSession();
//         session.startTransaction();

//         try {
//             const request = await this._payoutRepository.findById(input.payoutRequestId);

//             if (!request) throw createHttpError(HttpStatus.NOT_FOUND, "Payout request not found");
//             if (request.status !== PAYOUT_REQUEST_STATUS.PENDING) throw createHttpError(HttpStatus.BAD_REQUEST, "Request already processed");

//             if (input.decision === "approve") {
//                 const adminWalletId = process.env.SUPER_ADMIN_ID!;

//                 // ── Double-Entry Transfer (Admin -> Host) ───────────────────
//                 // Note: The admin keeps the commission because they originally collected the full grossAmount.
//                 // We only transfer the netAmount to the host.
//                 await this._walletService.transferFunds({
//                     fromUserId: adminWalletId,
//                     toUserId: request.hostRef.toString(),
//                     transferAmount: request.netAmount,
//                     fromTransactionType: TRANSACTION_TYPE.HOST_PAYOUT,
//                     toTransactionType: TRANSACTION_TYPE.HOST_PAYOUT,
//                     referenceType: TRANSACTION_REFERENCE_TYPE.PAYOUT_REQUEST,
//                     referenceId: request._id,
//                     description: `Payout for event completion. Event name: --------.`,
//                 }, { session });

//                 await this._payoutRepository.updateStatus(request._id, PAYOUT_REQUEST_STATUS.PAID, input.adminId, { session });

//             } else {
//                 await this._payoutRepository.updateStatus(request._id, PAYOUT_REQUEST_STATUS.REJECTED, input.adminId, { 
//                     session, 
//                     rejectionReason: input.rejectionReason 
//                 });
//             }

//             await session.commitTransaction();
//             return request as any; // Map to DTO as needed

//         } catch (error) {
//             await session.abortTransaction();
//             throw error;
//         } finally {
//             session.endSession();
//         }
//     }


//     // backend/src/services/payout.service.ts — when admin approves host payout
//     async approveHostPayout(payoutRequestId: string, adminId: string): Promise<void> {
//         const settings = await this._settingsService.getSettings();
//         const payoutRequest = await this._payoutRepository.findById(payoutRequestId);

//         const commission = Math.round(
//             (payoutRequest.grossAmount * settings.commissionPercent) / 100
//         );
//         const netPayoutAmount = payoutRequest.grossAmount - commission;

//         // this._walletService.transferFunds ?? transfering fund from admin to host wallet??
//         await this._walletService.creditToWallet({
//             userId: payoutRequest.hostId,
//             amount: netPayoutAmount,
//             // ...
//         });
//     }


//     async getPayoutRequests(filters: GetPayoutRequestsFilter): Promise<GetPayoutRequestsResponse> {
//         return await this._payoutRepository.findPayouts(filters); // Map via DTOs
//         throw new Error("Not implemented");
//     }

//     async getMyPayoutRequests(hostId: string, filters: GetPayoutRequestsFilter): Promise<GetPayoutRequestsResponse> {
//         return await this._payoutRepository.findPayouts({ ...filters, hostRef: hostId });
//         throw new Error("Not implemented");
//     }
// }
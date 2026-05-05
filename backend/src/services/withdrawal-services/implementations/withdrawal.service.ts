// backend/src/services/wallet-services/implementations/withdrawal.service.ts

import { IWalletService } from "@/services/wallet-services/interfaces/IWalletService";
import { IWithdrawalService } from "../interfaces/IWithdrawalService";
import { IWithdrawalRequestRepository } from "@/repositories/interfaces/IWithdrawalRequestRepository";

import { 
    WithdrawalRequestResponseDTO, 
    GetWithdrawalRequestsResponse 
} from "@/dtos/wallet.dto";

import { 
    TRANSACTION_TYPE, 
    TRANSACTION_REFERENCE_TYPE, 
    WITHDRAWAL_STATUS, 
    CreateWithdrawalRequestInput,
    GetWithdrawalRequestsFilter
} from "@/types/wallet.types";

import { createHttpError } from "@/utils/httpError.utils";
import { HttpStatus } from "@/constants/statusCodes.constants";
// import Razorpay from 'razorpay'; 



export class WithdrawalService implements IWithdrawalService {
    constructor(
        private readonly _withdrawalRepository: IWithdrawalRequestRepository,
        private readonly _walletService: IWalletService,
    ) {}


    async createWithdrawalRequest(input: CreateWithdrawalRequestInput): Promise<WithdrawalRequestResponseDTO> {
        const session = await this._withdrawalRepository.startSession();
        session.startTransaction();

        try {
            // 1. Deduct from Host Wallet Immediately (to prevent double spending)
            await this._walletService.debitFromWallet({
                userId: input.hostRef.toString(),
                amount: input.amount,
                transactionType: TRANSACTION_TYPE.WITHDRAWAL,
                referenceType: TRANSACTION_REFERENCE_TYPE.WITHDRAWAL_REQUEST,
                referenceId: "PENDING_ID", // Will update after creation
                description: `Bank withdrawal initiated`,
            }, { session });

            // 2. Save Withdrawal Request to DB
            const request = await this._withdrawalRepository.create(input, { session });

            // 3. Initiate Razorpay Payouts API Call (Mocked here)
            // const rzpPayout = await razorpay.payouts.create({ account_number: input.bankDetails.accountNumber, amount: input.amount * 100, currency: "INR", mode: "IMPS", purpose: "payout" });
            const rzpPayoutId = "pout_test123"; 

            await this._withdrawalRepository.updateRazorpayId(request._id, rzpPayoutId, { session });
            
            await session.commitTransaction();
            return request as any;

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async handleWithdrawalWebhook(
        razorpayPayoutId: string, 
        event: "payout.processed" | "payout.failed", 
        failureReason?: string
    ): Promise<void> {
        const request = await this._withdrawalRepository.findByRazorpayId(razorpayPayoutId);
        if (!request) return;

        if (event === "payout.processed") {
            await this._withdrawalRepository.updateStatus(request._id, WITHDRAWAL_STATUS.COMPLETED);
        } else if (event === "payout.failed") {
            const session = await this._withdrawalRepository.startSession();
            session.startTransaction();
            try {
                await this._withdrawalRepository.updateStatus(request._id, WITHDRAWAL_STATUS.FAILED, { failureReason, session });
                
                // Refund the host's wallet if the bank transfer failed
                await this._walletService.creditToWallet({
                userId: request.hostRef.toString(),
                amount: request.amount,
                transactionType: TRANSACTION_TYPE.WITHDRAWAL_REVERSAL,
                referenceType: TRANSACTION_REFERENCE_TYPE.WITHDRAWAL_REQUEST,
                referenceId: request._id,
                description: `Reversal for failed bank withdrawal`,
                }, { session });

                await session.commitTransaction();
            } catch(e) {
                await session.abortTransaction();
                throw e;
            } finally {
                session.endSession();
            }
        }
    }

    async getWithdrawalRequests(hostId: string, filters: GetWithdrawalRequestsFilter): Promise<GetWithdrawalRequestsResponse> {
        return await this._withdrawalRepository.findWithdrawals({ ...filters, hostRef: hostId });
    }


}
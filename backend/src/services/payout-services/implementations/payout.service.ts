// backend/src/services/payout-services/implementations/payout.service.ts
import { IWalletService } from "@/services/wallet-services/interfaces/IWalletService";
import { createHttpError } from "@/utils/httpError.utils";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { IPlatformSettingsService } from "@/services/platform-settings-services/interfaces/IPlatformSettingsService";
import { ClientSession } from "mongoose";
import { IPayoutService } from "@/services/payout-services/interfaces/IPayoutService";
import { IEventRepository } from "@/repositories/interfaces/IEventRepository";
import { PayoutEntity } from "@/entities/payout.entity";
import {
   CreatePayoutInput,
   GetPayoutsFilter,
   ReviewPayoutInput,
} from "@/types/payout.types";
import { mapPayoutEntityToDTO, mapToEligibleEventDTO } from "@/mappers/payout.mapper";
import { executeWithTransactionRetry } from "@/utils/transaction.utils";
import { EventEntity } from "@/entities/event.entity";
import { PlatformSettingsEntity } from "@/entities/platformSettings.entity";
import { IPayoutRepository } from "@/repositories/interfaces/IPayoutRequestRepository";
import { 
    EligibleEventDTO, 
    GetEligibleEventsResponse, 
    GetPayoutsResponse, 
    PayoutResponseDTO 
} from "@/dtos/payout.dto";
import { uploadToCloudinary } from "@/config/cloudinary";
import { validatePayoutRequest, validatePayoutReview } from "@/utils/validations/payoutValidations";
import { PAYOUT_REQUEST_STATUSES, PayoutRequestStatus } from "@/constants/payout.constants";
import { TRANSACTION_REFERENCE_TYPES, TRANSACTION_TYPES } from "@/constants/transaction.constants";





export class PayoutService implements IPayoutService {
    constructor(
        private readonly _payoutRepository  : IPayoutRepository,
        private readonly _eventRepository   : IEventRepository,
        private readonly _settingsService   : IPlatformSettingsService,
        private readonly _walletService     : IWalletService,
    ) {}


    // ─── Host: Request for payout ─────────────────────────────────────
    async requestPayout(hostId: string, eventId: string, proofFiles?: Express.Multer.File[]): Promise<PayoutResponseDTO> {
        const [event, existingPayout, settings]: [EventEntity | null, PayoutEntity | null, PlatformSettingsEntity]
            = await Promise.all([
                this._eventRepository.getEventById(eventId),
                this._payoutRepository.findPayoutByEventId(eventId),
                this._settingsService.getPlatformSettings()
            ]);

        const minPercentRequired    = settings?.minPayoutAttendancePercent ?? 30;
        const hasProofFiles         = !!proofFiles && proofFiles.length > 0;

        validatePayoutRequest(event, hostId, existingPayout, minPercentRequired, hasProofFiles);

        const grossAmount: number       = event.grossTicketRevenue ?? 0;
        const commissionRate: number    = (settings?.commissionPercent ?? 10) / 100;
        const commissionAmount: number  = Math.round(grossAmount * commissionRate);
        const netAmount: number         = grossAmount - commissionAmount;


        // --- Handle File Uploads ---
        let payoutProofUrls: string[] = [];
        
        if (proofFiles && proofFiles.length > 0) {
            const uploadPromises = proofFiles.map((file) => 
                uploadToCloudinary({
                    fileBuffer  : file.buffer,
                    folderPath  : "payout-proofs",
                    fileType    : "image",
                })
            );
            
            payoutProofUrls = await Promise.all(uploadPromises);
        }

        const createPayoutInput: CreatePayoutInput = {
            eventRef      : eventId,
            hostRef       : hostId,
            eventTitle    : event.title,
            hostName      : event.organizer?.organizerName ?? "Unknown Host",
            grossAmount,
            commissionRate,
            commissionAmount,
            netAmount,
            ticketsSold   : event.soldTickets ?? 0,
            checkedInCount: event.checkedInCount ?? 0,
            status        : PAYOUT_REQUEST_STATUSES.PENDING,
            proofUrls     : payoutProofUrls,
            requestedAt   : new Date(),
        };        

        const payout: PayoutEntity = await this._payoutRepository.createPayout(createPayoutInput);

        return mapPayoutEntityToDTO(payout);
    }



    // ─── Admin: Review (Approve / Reject) ─────────────────────────────────────
    async reviewPayout(
        adminId  : string,
        payoutId : string,
        payoutInput : ReviewPayoutInput,
    ): Promise<PayoutResponseDTO> {

        const payout: PayoutEntity | null = await this._payoutRepository.findPayoutById(payoutId);

        validatePayoutReview(payout, payoutInput);

        const systemWalletId: string | undefined = process.env.SUPER_ADMIN_ID;
        if (!systemWalletId) {
            throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "System wallet ID is not configured.");
        }

        // ── REJECT ──────
        if (payoutInput.action === "reject") {
            const updatedPayout: PayoutEntity | null = await this._payoutRepository.updatePayout(payoutId, {
                status         : PAYOUT_REQUEST_STATUSES.REJECTED,
                rejectionReason: payoutInput.rejectionReason!.trim(),
                reviewedBy     : adminId,
                reviewedAt     : new Date(),
            });

            // TODO: Trigger Email Notification to Host about Rejection here

            return mapPayoutEntityToDTO(updatedPayout!);
        }


        // ── APPROVE ──────
        if (payoutInput.action === "approve") {
            // inside a transaction
            const updatedPayout: PayoutEntity | null = await executeWithTransactionRetry(async (session: ClientSession) => {

                await this._walletService.transferFunds({
                    fromUserId          : systemWalletId,
                    toUserId            : payout.hostId,
                    transferAmount      : payout.netAmount,
                    fromTransactionType : TRANSACTION_TYPES.HOST_PAYOUT,
                    toTransactionType   : TRANSACTION_TYPES.HOST_PAYOUT,
                    referenceType       : TRANSACTION_REFERENCE_TYPES.PAYOUT_REQUEST,
                    referenceId         : payout.payoutId,
                    description         : `Payout for event: ${payout.eventTitle}`,
                    metadata            : {
                        eventId             : payout.eventId,
                        grossAmount         : payout.grossAmount,
                        commissionAmount    : payout.commissionAmount
                    }
                }, { session });

                // Mark payout as PAID
                return this._payoutRepository.updatePayout(
                    payoutId,
                    {
                        status      : PAYOUT_REQUEST_STATUSES.PAID,
                        reviewedBy  : adminId,
                        reviewedAt  : new Date(),
                    },
                    { session }
                );
            });

            // TODO: Trigger Email Notification to Host about Approval/Payment here

            return mapPayoutEntityToDTO(updatedPayout!);
        }

        // Failsafe return if action somehow bypassed checks
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Invalid action processing.");

    }


    // ─── Host: My Payouts ─────────────────────────────────────────────────────
    async getMyPayouts(hostId: string, filters: GetPayoutsFilter): Promise<GetPayoutsResponse> {
        const [payouts, total]: [PayoutEntity[], number] = await Promise.all([
            this._payoutRepository.findPayouts({ ...filters, hostId }),
            this._payoutRepository.countPayouts({ ...filters, hostId }),
        ]);

        return {
            payouts     : payouts.map(mapPayoutEntityToDTO),
            pagination  : {
                totalCount : total,
                totalPages : Math.ceil(total / filters.limit),
                currentPage: filters.page,
                limit      : filters.limit,
            },
        };
    }



    // ─── Admin: All Payouts ───────────────────────────────────────────────────
    async getAllPayouts(filters: GetPayoutsFilter): Promise<GetPayoutsResponse> {
        const [payouts, total]: [PayoutEntity[], number] = await Promise.all([
            this._payoutRepository.findPayouts(filters),
            this._payoutRepository.countPayouts(filters),
        ]);

        return {
            payouts     : payouts.map(mapPayoutEntityToDTO),
            pagination  : {
                totalCount : total,
                totalPages : Math.ceil(total / filters.limit),
                currentPage: filters.page,
                limit      : filters.limit,
            },
        };
    }


    // ─── Host: Eligible Events ────────────────────────────────────────────────
    async getEligibleEvents(hostId: string): Promise<GetEligibleEventsResponse> {
        let eligibleEvents: EventEntity[] = await this._eventRepository.getCompletedEventsByHost(hostId);

        eligibleEvents = eligibleEvents.filter(ev => (ev.soldTickets ?? 0) > 0 && (ev.grossTicketRevenue ?? 0) > 0);
        
        // fetch if existing payout requests for these events
        const eventIds: string[] = eligibleEvents.map((evt) => evt.eventId);
        const existingPayouts: PayoutEntity[] = await this._payoutRepository.findPayoutByEventIds(eventIds);

        const payoutMap = new Map<string, PayoutEntity>(existingPayouts.map(
            (payout) => [payout.eventId, payout]
        ));

        // Fetch live platform settings for the frontend UI
        const settings: PlatformSettingsEntity = await this._settingsService.getPlatformSettings();

        // Check which statuses mean the payout is "locked" and shouldn't be applied for again
        const activePayoutStatuses = [
            PAYOUT_REQUEST_STATUSES.PENDING, 
            PAYOUT_REQUEST_STATUSES.APPROVED, 
            PAYOUT_REQUEST_STATUSES.PAID
        ];

        // Process and filter the events
        const processedEvents: EligibleEventDTO[] = [];

        for (const evnt of eligibleEvents) {
            const payout = payoutMap.get(evnt.eventId);

            // If the event already has an active payout, skip it entirely
            if (payout && activePayoutStatuses.includes(payout.status as PayoutRequestStatus)) {
                continue; 
            }

            const eligibleEventDTO: EligibleEventDTO = mapToEligibleEventDTO(evnt, payout);
            
            // If the payout is rejected, we can treat it as "eligible again" 
            // but pass the rejection reason to the frontend to warn the user.
            if (payout?.status === PAYOUT_REQUEST_STATUSES.REJECTED) {
                eligibleEventDTO.previousRejectionReason    = payout.rejectionReason;
                eligibleEventDTO.canReapply                 = true; 
            }
            
            processedEvents.push(eligibleEventDTO);
        }

        return {
            commissionRate          : (settings?.commissionPercent ?? 10) / 100,
            minAttendancePercent    : settings?.minPayoutAttendancePercent ?? 30,
            events                  : processedEvents,
        };

    }


}
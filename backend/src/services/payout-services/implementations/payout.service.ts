// backend/src/services/payout-services/implementations/payout.service.ts
import { IWalletService } from "@/services/wallet-services/interfaces/IWalletService";
import { TRANSACTION_TYPE, TRANSACTION_REFERENCE_TYPE } from "@/types/wallet.types";
import { createHttpError } from "@/utils/httpError.utils";
import { HttpStatus } from "@/constants/statusCodes.constants";
import { 
    PAYOUT_REQUEST_STATUS, 
} from "@/types/payout.types";
import { IPlatformSettingsService } from "@/services/platform-settings-services/interfaces/IPlatformSettingsService";
import { ClientSession } from "mongoose";
import { IPayoutService } from "@/services/payout-services/interfaces/IPayoutService";
import { IEventRepository } from "@/repositories/interfaces/IEventRepository";
import { PayoutMessages, EventMessages } from "@/constants/responseMessages.constants";
import { PayoutEntity } from "@/entities/payout.entity";
import {
   CreatePayoutInput,
   GetPayoutsFilter,
   ReviewPayoutInput,
} from "@/types/payout.types";
import { mapPayoutEntityToDTO, mapToEligibleEventDTO } from "@/mappers/payout.mapper";
import { executeWithTransactionRetry } from "@/utils/transaction.utils";
import { EventEntity } from "@/entities/event.entity";
import { EVENT_STATUS } from "@/types/event.types";
import { PlatformSettingsEntity } from "@/entities/platformSettings.entity";
import { IPayoutRepository } from "@/repositories/interfaces/IPayoutRequestRepository";
import { EligibleEventDTO, GetEligibleEventsResponse, GetPayoutsResponse, PayoutResponseDTO } from "@/dtos/payout.dto";
import { uploadToCloudinary } from "@/config/cloudinary";





export class PayoutService implements IPayoutService {
    constructor(
        private readonly _payoutRepository  : IPayoutRepository,
        private readonly _eventRepository   : IEventRepository,
        private readonly _settingsService   : IPlatformSettingsService,
        private readonly _walletService     : IWalletService,
    ) {}


    // ─── Host: Request for payout ─────────────────────────────────────
    async requestPayout(hostId: string, eventId: string, proofFiles?: Express.Multer.File[]): Promise<PayoutResponseDTO> {
        // do all the validations with a separate validation utility function

        const event: EventEntity | null = await this._eventRepository.getEventById(eventId);
        if (!event) throw createHttpError(HttpStatus.NOT_FOUND, EventMessages.EVENT_NOT_FOUND);

        if (event.organizer.hostId.toString() !== hostId) {
            throw createHttpError(HttpStatus.FORBIDDEN, PayoutMessages.NOT_EVENT_HOST);
        }

        // event must be completed
        const isOfficiallyCompleted : boolean = event.eventStatus === EVENT_STATUS.COMPLETED;
        const isEventEndTimePast    : boolean = event.eventStatus === EVENT_STATUS.PUBLISHED && new Date() > event.endDateTime;

        if (!isOfficiallyCompleted && !isEventEndTimePast) {
            throw createHttpError(HttpStatus.BAD_REQUEST, PayoutMessages.EVENT_NOT_COMPLETED);
        }

        // Must have revenue to pay out
        const grossAmount = event.grossTicketRevenue ?? 0;
        if (grossAmount <= 0) {
            throw createHttpError(HttpStatus.BAD_REQUEST, PayoutMessages.NO_REVENUE);
        }

        // Check no existing payout for this event
        const existingPayout = await this._payoutRepository.findPayoutByEventId(eventId);
        const alreadyAppliedStatuses: PAYOUT_REQUEST_STATUS[] = [
            PAYOUT_REQUEST_STATUS.PENDING, 
            PAYOUT_REQUEST_STATUS.APPROVED, 
            PAYOUT_REQUEST_STATUS.PAID
        ];
        if (existingPayout && alreadyAppliedStatuses.includes(existingPayout.status as PAYOUT_REQUEST_STATUS)) {
            throw createHttpError(HttpStatus.CONFLICT, PayoutMessages.PAYOUT_ALREADY_REQUESTED);
        }

        const settings: PlatformSettingsEntity = await this._settingsService.getPlatformSettings();
        const commissionRate: number    = (settings?.commissionPercent ?? 10) / 100;
        const commissionAmount: number  = Math.round(grossAmount * commissionRate);
        const netAmount: number         = grossAmount - commissionAmount;

        const eventAttendancePercent    = ((event.checkedInCount ?? 0) / (event.soldTickets ?? 1)) * 100;
        const minPercentRequired        = settings?.minPayoutAttendancePercent ?? 30;

        if (eventAttendancePercent < minPercentRequired && (!proofFiles || proofFiles.length === 0)) {
            throw createHttpError(
                HttpStatus.BAD_REQUEST, 
                `Attendance is ${Math.round(minPercentRequired)}% (below ${minPercentRequired}%). You must attach proof images of the event to request a payout.`
            );
        }


        // --- Handle File Uploads ---
        const payoutProofUrls: string[] = [];
        if (proofFiles && proofFiles.length > 0) {
            for (const file of proofFiles) {
                const url = await uploadToCloudinary({
                    fileBuffer: file.buffer,
                    folderPath: "payout-proofs",
                    fileType: "image",
                });
                payoutProofUrls.push(url);
            }
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
            status        : PAYOUT_REQUEST_STATUS.PENDING,
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
        if (!payout) throw createHttpError(HttpStatus.NOT_FOUND, PayoutMessages.PAYOUT_NOT_FOUND);

        if (payout.status !== PAYOUT_REQUEST_STATUS.PENDING) {
            throw createHttpError(HttpStatus.BAD_REQUEST, PayoutMessages.PAYOUT_ALREADY_REVIEWED);
        }

        // ── REJECT ──────
        if (payoutInput.action === "reject") {
            if (!payoutInput.rejectionReason?.trim()) {
                throw createHttpError(HttpStatus.BAD_REQUEST, PayoutMessages.REJECTION_REASON_REQUIRED);
            }

            const updatedPayout: PayoutEntity | null = await this._payoutRepository.updatePayout(payoutId, {
                status         : PAYOUT_REQUEST_STATUS.REJECTED,
                rejectionReason: payoutInput.rejectionReason.trim(),
                reviewedBy     : adminId,
                reviewedAt     : new Date(),
            });

            return mapPayoutEntityToDTO(updatedPayout!);
        }

        // ── APPROVE: inside a transaction ──────
        const updatedPayout: PayoutEntity | null = await executeWithTransactionRetry(async (session: ClientSession) => {

            // Debit Admin / Credit Host via Double-Entry Transfer
            await this._walletService.transferFunds({
                fromUserId          : process.env.SUPER_ADMIN_ID!,
                toUserId            : payout.hostId,
                transferAmount      : payout.netAmount,
                fromTransactionType : TRANSACTION_TYPE.HOST_PAYOUT,
                toTransactionType   : TRANSACTION_TYPE.HOST_PAYOUT,
                referenceType       : TRANSACTION_REFERENCE_TYPE.PAYOUT_REQUEST,
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
                    status      : PAYOUT_REQUEST_STATUS.PAID,
                    reviewedBy  : adminId,
                    reviewedAt  : new Date(),
                },
                { session }
            );
        });

        return mapPayoutEntityToDTO(updatedPayout!);
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
        const eventIds: string[] = eligibleEvents.map((evt) => evt.id);

        const existingPayouts: PayoutEntity[] = await this._payoutRepository.findPayoutByEventIds(eventIds);

        const payoutMap = new Map<string, PayoutEntity>(existingPayouts.map(
            (payout) => [payout.eventId, payout]
        ));

        // Fetch live platform settings for the frontend UI
        const settings: PlatformSettingsEntity = await this._settingsService.getPlatformSettings();

        return {
            commissionRate          : (settings?.commissionPercent ?? 10) / 100,
            minAttendancePercent    : settings?.minPayoutAttendancePercent ?? 30,
            events                  : eligibleEvents.map((evnt) => {
                const payout: PayoutEntity | undefined = payoutMap.get(evnt.id);
                return mapToEligibleEventDTO(evnt, payout);
            }),
        };

    }


}
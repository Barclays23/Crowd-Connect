// backend/src/utils/validations/payoutValidations.ts

import { HTTP_STATUS } from "@/constants/http-status.constants";
import { EVENT_MESSAGES, PAYOUT_MESSAGES } from "@/constants/messages.constants";
import { EventEntity } from "@/entities/event.entity";
import { PayoutEntity } from "@/entities/payout.entity";
import { createHttpError } from "@/utils/httpError.utils";
import { ReviewPayoutInput } from "@/types/payout.types";
import { EVENT_STATUSES } from "@/constants/event.constants";
import { PAYOUT_REQUEST_STATUSES, PayoutRequestStatus } from "@/constants/payout.constants";



export function validatePayoutRequest(
    event: EventEntity | null,
    hostId: string,
    existingPayout: PayoutEntity | null,
    minPercentRequired: number,
    hasProofFiles: boolean
): asserts event is EventEntity {
    
    if (!event) {
        throw createHttpError(HTTP_STATUS.NOT_FOUND, EVENT_MESSAGES.EVENT_NOT_FOUND);
    }

    if (event.organizer.hostId.toString() !== hostId) {
        throw createHttpError(HTTP_STATUS.FORBIDDEN, PAYOUT_MESSAGES.NOT_EVENT_HOST);
    }

    // event must be completed
    const isOfficiallyCompleted: boolean    = event.eventStatus === EVENT_STATUSES.COMPLETED;
    const isEventEndTimePast: boolean       = event.eventStatus === EVENT_STATUSES.PUBLISHED && new Date() > event.endDateTime;

    if (!isOfficiallyCompleted && !isEventEndTimePast) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, PAYOUT_MESSAGES.EVENT_NOT_COMPLETED);
    }

    // Must have revenue to pay out
    const grossAmount = event.grossTicketRevenue ?? 0;
    if (grossAmount <= 0) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, PAYOUT_MESSAGES.NO_REVENUE);
    }

    // Check no existing payout for this event
    const alreadyAppliedStatuses: PayoutRequestStatus[] = [
        PAYOUT_REQUEST_STATUSES.PENDING, 
        PAYOUT_REQUEST_STATUSES.APPROVED, 
        PAYOUT_REQUEST_STATUSES.PAID
    ];

    if (existingPayout && alreadyAppliedStatuses.includes(existingPayout.status as PayoutRequestStatus)) {
        throw createHttpError(HTTP_STATUS.CONFLICT, PAYOUT_MESSAGES.PAYOUT_ALREADY_REQUESTED);
    }

    const eventAttendancePercent = ((event.checkedInCount ?? 0) / (event.soldTickets || 1)) * 100;

    if (eventAttendancePercent < minPercentRequired && !hasProofFiles) {
        throw createHttpError(
            HTTP_STATUS.BAD_REQUEST, 
            `Attendance is ${Math.round(eventAttendancePercent)}% (below ${minPercentRequired}%). You must attach proof images of the event to request a payout.`
        );
    }
}







export function validatePayoutReview(
    payout: PayoutEntity | null,
    payoutInput: ReviewPayoutInput
): asserts payout is PayoutEntity {
    if (!payout) {
        throw createHttpError(HTTP_STATUS.NOT_FOUND, PAYOUT_MESSAGES.PAYOUT_NOT_FOUND);
    }

    if (payout.status !== PAYOUT_REQUEST_STATUSES.PENDING) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, PAYOUT_MESSAGES.PAYOUT_ALREADY_REVIEWED);
    }

    if (payoutInput.action === "reject" && (!payoutInput.rejectionReason || !payoutInput.rejectionReason.trim())) {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, PAYOUT_MESSAGES.REJECTION_REASON_REQUIRED);
    }

    // Safety net in case Zod is somehow bypassed
    if (payoutInput.action !== "approve" && payoutInput.action !== "reject") {
        throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Invalid action. Must be 'approve' or 'reject'.");
    }
}
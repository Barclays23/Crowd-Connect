// backend/src/utils/validations/payoutValidations.ts

import { HttpStatus } from "@/constants/statusCodes.constants";
import { EventMessages, PayoutMessages } from "@/constants/responseMessages.constants";
import { EventEntity } from "@/entities/event.entity";
import { PayoutEntity } from "@/entities/payout.entity";
import { EVENT_STATUS } from "@/types/event.types";
import { PAYOUT_REQUEST_STATUS } from "@/types/payout.types";
import { createHttpError } from "@/utils/httpError.utils";
import { ReviewPayoutInput } from "@/types/payout.types";



export function validatePayoutRequest(
    event: EventEntity | null,
    hostId: string,
    existingPayout: PayoutEntity | null,
    minPercentRequired: number,
    hasProofFiles: boolean
): asserts event is EventEntity {
    
    if (!event) {
        throw createHttpError(HttpStatus.NOT_FOUND, EventMessages.EVENT_NOT_FOUND);
    }

    if (event.organizer.hostId.toString() !== hostId) {
        throw createHttpError(HttpStatus.FORBIDDEN, PayoutMessages.NOT_EVENT_HOST);
    }

    // event must be completed
    const isOfficiallyCompleted: boolean    = event.eventStatus === EVENT_STATUS.COMPLETED;
    const isEventEndTimePast: boolean       = event.eventStatus === EVENT_STATUS.PUBLISHED && new Date() > event.endDateTime;

    if (!isOfficiallyCompleted && !isEventEndTimePast) {
        throw createHttpError(HttpStatus.BAD_REQUEST, PayoutMessages.EVENT_NOT_COMPLETED);
    }

    // Must have revenue to pay out
    const grossAmount = event.grossTicketRevenue ?? 0;
    if (grossAmount <= 0) {
        throw createHttpError(HttpStatus.BAD_REQUEST, PayoutMessages.NO_REVENUE);
    }

    // Check no existing payout for this event
    const alreadyAppliedStatuses: PAYOUT_REQUEST_STATUS[] = [
        PAYOUT_REQUEST_STATUS.PENDING, 
        PAYOUT_REQUEST_STATUS.APPROVED, 
        PAYOUT_REQUEST_STATUS.PAID
    ];

    if (existingPayout && alreadyAppliedStatuses.includes(existingPayout.status as PAYOUT_REQUEST_STATUS)) {
        throw createHttpError(HttpStatus.CONFLICT, PayoutMessages.PAYOUT_ALREADY_REQUESTED);
    }

    const eventAttendancePercent = ((event.checkedInCount ?? 0) / (event.soldTickets || 1)) * 100;

    if (eventAttendancePercent < minPercentRequired && !hasProofFiles) {
        throw createHttpError(
            HttpStatus.BAD_REQUEST, 
            `Attendance is ${Math.round(eventAttendancePercent)}% (below ${minPercentRequired}%). You must attach proof images of the event to request a payout.`
        );
    }
}







export function validatePayoutReview(
    payout: PayoutEntity | null,
    payoutInput: ReviewPayoutInput
): asserts payout is PayoutEntity {
    if (!payout) {
        throw createHttpError(HttpStatus.NOT_FOUND, PayoutMessages.PAYOUT_NOT_FOUND);
    }

    if (payout.status !== PAYOUT_REQUEST_STATUS.PENDING) {
        throw createHttpError(HttpStatus.BAD_REQUEST, PayoutMessages.PAYOUT_ALREADY_REVIEWED);
    }

    if (payoutInput.action === "reject" && (!payoutInput.rejectionReason || !payoutInput.rejectionReason.trim())) {
        throw createHttpError(HttpStatus.BAD_REQUEST, PayoutMessages.REJECTION_REASON_REQUIRED);
    }

    // Safety net in case Zod is somehow bypassed
    if (payoutInput.action !== "approve" && payoutInput.action !== "reject") {
        throw createHttpError(HttpStatus.BAD_REQUEST, "Invalid action. Must be 'approve' or 'reject'.");
    }
}
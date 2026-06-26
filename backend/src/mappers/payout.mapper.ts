// backend/src/mappers/payout.mapper.ts

import { PayoutEntity } from "@/entities/payout.entity";
import { IPayoutRequestModel } from "@/types/payout.types";
import { EligibleEventDTO, PayoutResponseDTO } from "@/dtos/payout.dto";
import { EventEntity } from "@/entities/event.entity";



// Mongoose Document to Entity
export function mapModelToPayoutEntity(model: IPayoutRequestModel): PayoutEntity {
    return {
        payoutId        : model._id.toString(),
        eventId         : model.eventRef.toString(),
        hostId          : model.hostRef.toString(),

        eventTitle      : model.eventTitle,
        hostName        : model.hostName,

        ticketsSold     : model.ticketsSold,

        grossAmount     : model.grossAmount,
        commissionRate  : model.commissionRate,
        commissionAmount: model.commissionAmount,
        netAmount       : model.netAmount,
        checkedInCount  : model.checkedInCount,

        status          : model.status,
        requestedAt     : model.requestedAt.toISOString(),
        reviewedAt      : model.reviewedAt?.toISOString(),
        reviewedBy      : model.reviewedBy?.toString(),
        rejectionReason : model.rejectionReason,
        notes           : model.notes,
        proofUrls       : model.proofUrls,

        createdAt       : model.createdAt.toISOString(),
        updatedAt       : model.updatedAt.toISOString()
    };
}



// Domain Entity to Response DTO
export function mapPayoutEntityToDTO(entity: PayoutEntity): PayoutResponseDTO {
    return {
        payoutId            : entity.payoutId,
        eventId             : entity.eventId,
        hostId              : entity.hostId,

        eventTitle          : entity.eventTitle,
        hostName            : entity.hostName,
        
        grossAmount         : entity.grossAmount,
        commissionRate      : entity.commissionRate,
        commissionAmount    : entity.commissionAmount,
        netAmount           : entity.netAmount,
        ticketsSold         : entity.ticketsSold,
        checkedInCount      : entity.checkedInCount,
        
        status              : entity.status,
        requestedAt         : entity.requestedAt,
        reviewedBy          : entity.reviewedBy,
        reviewedAt          : entity.reviewedAt,
        rejectionReason     : entity.rejectionReason,

        proofUrls           : entity.proofUrls,

        createdAt           : entity.createdAt
    };
}




export function mapToEligibleEventDTO(event: EventEntity, payout?: PayoutEntity): EligibleEventDTO {
    return {
        eventId           : event.eventId,
        title             : event.title,
        endDateTime       : event.endDateTime,
        grossTicketRevenue: event.grossTicketRevenue ?? 0,
        soldTickets       : event.soldTickets ?? 0,
        ticketPrice       : event.ticketPrice ?? 0,
        checkedInCount    : event.checkedInCount ?? 0,
        payoutRequested   : !!payout,
        payoutStatus      : payout?.status,
    };
}
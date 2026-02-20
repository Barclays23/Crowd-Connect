import { CreateEventDTO, EventResponseDTO, EventStatusUpdateRequestDto, EventStatusUpdateResponseDto } from "@/dtos/event.dto";
import { CreateEventInput, EventEntity, EventStatusUpdateInput } from "@/entities/event.entity";
import { EVENT_STATUS, IEventModel, IEventModelPopulatedHost, IHostPopulatedFromEvent } from "@/types/event.types";
import { getEventDisplayStatus } from "@/utils/eventStatus.utils";
import { capitalize, toTitleCase } from "@/utils/string.utils";
import { Request } from "express";
import { Types } from "mongoose";



/* ────────────────────────────────── HTTP REQUEST → DTO ────────────────────────────────── */

export const mapCreateEventRequestToDto = (
   req: Request
): CreateEventDTO => {
   const body = req.body;
   const currentUserId = req.user.userId;

   return {
      hostRef: currentUserId,

      title: body.title,
      description: body.description,
      category: body.category,

      format: body.format,
      ticketType: body.ticketType,

      ticketPrice: Number(body.ticketPrice),
      capacity: Number(body.capacity),

      startDateTime: new Date(body.startDateTime),
      endDateTime: new Date(body.endDateTime),

      locationName: body.locationName,
      location: typeof body.location === "string"
        ? JSON.parse(body.location) // if not already parsed from zod validation (validateRequest)
        : body.location,

      onlineLink: body.onlineLink,
   };
};



/* ────────────────────────────────── MODEL → ENTITY ────────────────────────────────── */

export const mapEventModelToEventEntity = (
  doc: IEventModel | IEventModelPopulatedHost
): EventEntity => {
   const isPopulated = typeof doc.hostRef === 'object' && doc.hostRef !== null && 'name' in doc.hostRef;

   const host = isPopulated
    ? (doc.hostRef as IHostPopulatedFromEvent)
    : { _id: doc.hostRef as Types.ObjectId, name: '', organizationName: undefined };

   return {
      id: doc._id.toString(),
      // hostRef: doc.hostRef.toString(),

      organizer: {
         hostId: host._id.toString(),
         hostName: host.name ?? '',
         organizerName: host.organizationName ?? '',
      },
      
      title: doc.title,
      category: doc.category,
      description: doc.description,
      
      posterUrl: doc.posterUrl,
      
      format: doc.format,
      locationName: doc.locationName,
      location: doc.location,
      onlineLink: doc.onlineLink,
      
      startDateTime: doc.startDateTime,
      endDateTime: doc.endDateTime,
      
      ticketType: doc.ticketType,
      ticketPrice: doc.ticketPrice,
      capacity: doc.capacity,
      
      soldTickets: doc.soldTickets,
      checkedInCount: doc.checkedInCount,
      grossTicketRevenue: doc.grossTicketRevenue,
      
      eventStatus: doc.eventStatus,
      views: doc.views,

      cancellation: doc.cancellation ? {
         reason:       doc.cancellation.reason,
         cancelledBy:  doc.cancellation.cancelledBy,   // "ADMIN" | "HOST"
         cancelledAt:  doc.cancellation.cancelledAt,
         } : undefined,
      
      createdAt: doc.createdAt,
   }
};
   





/* ────────────────────────────────── ENTITY → RESPONSE DTO ────────────────────────────────── */

export const mapEventEntityToEventResponseDto = (
  entity: EventEntity
): EventResponseDTO => ({
   
   eventId: entity.id,
   // hostRef: entity.hostRef,
   organizer: {
      hostId: entity.organizer.hostId,
      hostName: entity.organizer.hostName,
      organizerName: entity.organizer.organizerName,
   },

   title: entity.title,
   category: entity.category,
   description: entity.description,
   
   posterUrl: entity.posterUrl,
   
   format: entity.format,
   locationName: entity.locationName,
   location: entity.location,
   onlineLink: entity.onlineLink,
   
   startDateTime: entity.startDateTime.toISOString(),
   endDateTime: entity.endDateTime.toISOString(),
   
   ticketType: entity.ticketType,
   ticketPrice: entity.ticketPrice,
   capacity: entity.capacity,
   
   soldTickets: entity.soldTickets,
   checkedInCount: entity.checkedInCount,
   grossTicketRevenue: entity.grossTicketRevenue,
   
   eventStatus: getEventDisplayStatus(entity),

   cancellation: entity.cancellation?.cancelledBy
      ? {
            reason: entity.cancellation.reason,
            cancelledBy: entity.cancellation.cancelledBy,
            cancelledAt: entity.cancellation.cancelledAt?.toISOString(),
         }
      : undefined,
   
   createdAt: entity.createdAt.toISOString(),
});





// EVENT ENTITY to EventStatusUpdateResponse DTO
export const mapToEventStatusUpdateResponseDto = (
   event: EventEntity
): EventStatusUpdateResponseDto => {
   return {
      updatedStatus: event.eventStatus,
      // cancelledAt: event.cancellation?.cancelledAt.toISOString(),
      // reason: event.cancellation?.reason,
   };
};







/* ────────────────────────────────── DTO → INPUT ────────────────────────────────── */

export const mapCreateEventRequestDtoToInput = ({
   createDto,
   eventPosterUrl,
   // currentUserId,
}: {
   createDto: CreateEventDTO;
   eventPosterUrl: string;
   // currentUserId: string;
}): CreateEventInput => {
   return {
      hostRef: new Types.ObjectId(createDto.hostRef),

      title: toTitleCase(createDto.title),
      description: capitalize(createDto.description),
      category: createDto.category,
      
      posterUrl: eventPosterUrl,
      
      format: createDto.format,
      locationName: createDto.locationName,
      location: createDto.location ?? undefined,
      onlineLink: createDto.onlineLink,
      
      startDateTime: new Date(createDto.startDateTime),
      endDateTime: new Date(createDto.endDateTime),
      
      ticketType: createDto.ticketType,
      ticketPrice: createDto.ticketPrice,
      capacity: createDto.capacity,
      
      // soldTickets: 0,
      // checkedInCount: 0,
      // grossTicketRevenue: 0,
      
      eventStatus: EVENT_STATUS.DRAFT,
   };
};



export const mapToEventStatusUpdateInput = (
  { newStatus, reason }: EventStatusUpdateRequestDto
): EventStatusUpdateInput => {

   switch (newStatus) {
      case "completed":
         return {
            eventStatus: EVENT_STATUS.COMPLETED,
         };

      case "cancelled":
         return {
            eventStatus: EVENT_STATUS.CANCELLED,
            cancellation: {
               reason: `CANCELLED: ${reason}`,
               cancelledBy: "ADMIN",
               cancelledAt: new Date(),
            },
         };

      case "suspended":
         return {
            eventStatus: EVENT_STATUS.SUSPENDED,
            cancellation: {
               reason: `SUSPENDED: ${reason}`,
               cancelledBy: "ADMIN",
               cancelledAt: new Date(),
            },
         };

      default:
         throw new Error("Invalid event action");
   }
};

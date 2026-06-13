import { 
   CreateEventRequestDTO, 
   EventResponseDTO, 
   EventStatusUpdateRequestDto, 
   UpdateEventRequestDTO 
} from "@/dtos/event.dto";
import { 
   CreateEventInput, 
   EventEntity, 
   EventStatusUpdateInput, 
   UpdateEventInput 
} from "@/entities/event.entity";
import { 
   DEFAULT_RADIUS_KM, 
   EVENT_CATEGORY, 
   EVENT_FORMAT, 
   EVENT_STATUS, 
   GetPublicEventsFilter, 
   IEventModel, 
   IEventModelPopulatedHost, 
   IHostPopulatedFromEvent, 
   TICKET_TYPE 
} from "@/types/event.types";
import { getEventDisplayStatus } from "@/utils/eventStatus.utils";
import { capitalize, toTitleCase } from "@/utils/string.utils";
import { Request } from "express";
import { Types } from "mongoose";


/* ────────────────────────────────── HTTP REQUEST → DTO / FILTER ────────────────────────────────── */

export const mapCreateEventRequestToDto = (
   req: Request
): CreateEventRequestDTO => {
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



export const mapEventDiscoveryQueryToFilters = (req: Request): GetPublicEventsFilter => {
   return {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 12,
      search: (req.query.search as string)?.trim(),
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      category: (req.query.category as string)?.trim() as EVENT_CATEGORY,
      format: (req.query.format as string)?.trim() as EVENT_FORMAT,
      ticketType: (req.query.ticketType as string)?.trim() as TICKET_TYPE,
      lat: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
      lng: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
      radiusKm: req.query.radiusKm ? parseFloat(req.query.radiusKm as string) : DEFAULT_RADIUS_KM,
      sortBy: (req.query.sort as GetPublicEventsFilter["sortBy"]) || "upcoming",
   };
};



/* ────────────────────────────────── MODEL → ENTITY ────────────────────────────────── */

export const mapEventModelToEventEntity = (
  doc: IEventModel | IEventModelPopulatedHost
): EventEntity => {
   const isPopulated = typeof doc.hostRef === 'object' && doc.hostRef !== null && 'name' in doc.hostRef;

   let organizer = {
      hostId: '',
      hostName: '',
      organizerName: '',
   };

   if (isPopulated) {
      const host = doc.hostRef as IHostPopulatedFromEvent;
      organizer = {
         hostId: host._id.toString(),
         hostName: host.name || '',
         organizerName: host.organizationName || '',
      };
   } else {
      organizer = {
         hostId: doc.hostRef.toString(),
         hostName: '',
         organizerName: '',
      };
   }

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










/* ────────────────────────────────── DTO → INPUT ────────────────────────────────── */

export const mapCreateEventRequestDtoToInput = ({
   createDto,
   eventPosterUrl,
   // currentUserId,
}: {
   createDto: CreateEventRequestDTO;
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




export const mapUpdateEventRequestDtoToInput = ({
   updateEventDto,
   existingEvent,
   updatedPosterUrl,
}: {
   updateEventDto: UpdateEventRequestDTO;
   existingEvent:  EventEntity;           // ← pass existing so we can compare
   updatedPosterUrl?: string;             // ← undefined if no new image
}): UpdateEventInput => {

   const input: UpdateEventInput = {};

   if (updateEventDto.title && updateEventDto.title !== existingEvent.title) {
      input.title = toTitleCase(updateEventDto.title);
   }
   if (updateEventDto.description && updateEventDto.description !== existingEvent.description) {
      input.description = capitalize(updateEventDto.description);
   }
   if (updateEventDto.category && updateEventDto.category !== existingEvent.category) {
      input.category = updateEventDto.category;
   }
   if (updateEventDto.startDateTime &&
      new Date(updateEventDto.startDateTime).getTime() !== existingEvent.startDateTime.getTime()) {
      input.startDateTime = new Date(updateEventDto.startDateTime);
   }
   if (updateEventDto.endDateTime &&
      new Date(updateEventDto.endDateTime).getTime() !== existingEvent.endDateTime.getTime()) {
      input.endDateTime = new Date(updateEventDto.endDateTime);
   }
   if (updateEventDto.format && updateEventDto.format !== existingEvent.format) {
      input.format = updateEventDto.format;
   }
   if (updateEventDto.ticketType && updateEventDto.ticketType !== existingEvent.ticketType) {
      input.ticketType = updateEventDto.ticketType;
   }
   if (updateEventDto.ticketPrice !== undefined &&
      updateEventDto.ticketPrice !== existingEvent.ticketPrice) {
      input.ticketPrice = updateEventDto.ticketPrice;
   }
   if (updateEventDto.capacity !== undefined &&
      updateEventDto.capacity !== existingEvent.capacity) {
      input.capacity = updateEventDto.capacity;
   }
   if (updateEventDto.locationName !== undefined &&
      updateEventDto.locationName !== existingEvent.locationName) {
      input.locationName = updateEventDto.locationName;
   }
   if (updateEventDto.location !== undefined) {
      const newLoc = updateEventDto.location ?? null;
      const oldLoc = existingEvent.location ?? null;

      const hasChanged =
         !oldLoc ||
         !newLoc ||
         newLoc.type !== oldLoc.type ||
         roundCoordinates(newLoc.coordinates[0]) !== roundCoordinates(oldLoc.coordinates[0]) ||
         roundCoordinates(newLoc.coordinates[1]) !== roundCoordinates(oldLoc.coordinates[1]);

      if (hasChanged) {
         input.location = newLoc;
      }

      function roundCoordinates(value: number) {
         return Number(value.toFixed(6)); // 6 decimal precision is enough for GPS
      }
   }

   if (updateEventDto.onlineLink !== undefined &&
      updateEventDto.onlineLink !== existingEvent.onlineLink) {
      input.onlineLink = updateEventDto.onlineLink ?? null;
   }

   // Poster — only if new image was actually uploaded
   if (updatedPosterUrl !== undefined) {
      input.posterUrl = updatedPosterUrl;
   }

   return input;
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
               cancelledBy: "HOST",
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


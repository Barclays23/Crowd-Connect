import { CreateEventDTO, EventResponseDTO } from "@/dtos/event.dto";
import { CreateEventInput, EventEntity } from "@/entities/event.entity";
import { EVENT_STATUS, IEventModel, ILocation } from "@/types/event.types";
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

export const mapEventModelToEventEntity = (doc: IEventModel): EventEntity => ({
  id: doc._id.toString(),
  hostRef: doc.hostRef.toString(),

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

  createdAt: doc.createdAt,
});






/* ────────────────────────────────── ENTITY → RESPONSE DTO ────────────────────────────────── */

export const mapEventEntityToEventResponseDto = (
  entity: EventEntity
): EventResponseDTO => ({
   
   eventId: entity.id,
   hostRef: entity.hostRef,

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
   
   eventStatus: entity.eventStatus,
   
   createdAt: entity.createdAt.toISOString(),
});







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

      title: createDto.title,
      description: createDto.description,
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

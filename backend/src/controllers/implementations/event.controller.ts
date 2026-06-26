// src/controllers/implementations/event.controller.ts

import { Request, Response, NextFunction } from "express";
import { IEventController } from "../interfaces/IEventController";
import { IEventServices } from "@/services/event-services/interfaces/IEventServices";
import { 
    CreateEventRequestDTO, 
    EventResponseDTO, 
    GetDiscoveryEventsResult, 
    UpdateEventRequestDTO 
} from "@/dtos/event.dto";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { 
    mapCreateEventRequestToDto, 
    mapEventDiscoveryQueryToFilters 
} from "@/mappers/event.mapper";
import { 
    allowedEventSortFields, 
    GetAllEventsResult, 
    GetEventsFilter, 
    GetPublicEventsFilter, 
} from "@/types/event.types";
import { SortOrder } from "mongoose";
import { 
    ALLOWED_BOOKING_SORT_FIELDS, 
    BookingSortField, 
    GetBookingsFilter 
} from "@/types/booking.types";
import { GetBookingsResponseDTO } from "@/dtos/booking.dto";
import { IBookingService } from "@/services/booking-services/interfaces/IBookingService";
import { EVENT_MESSAGES } from "@/constants/messages.constants";
import { EventCategory, EventFormat, EventStatus, TicketType } from "@/constants/event.constants";
import { BookingStatus } from "@/constants/booking.constants";





export class EventController implements IEventController {
    constructor(
        private _eventServices: IEventServices,
        private _bookingServices: IBookingService,
    ) {}


    async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "Unauthorized: User information missing" });
                return;
            }

            const body = req.body;
            const currentUserId: string = req.user.userId;
            const imageFile: Express.Multer.File | undefined = req.file;

            const createDto: CreateEventRequestDTO = mapCreateEventRequestToDto(req, currentUserId);

            const createdEvent: EventResponseDTO = await this._eventServices.createEvent({
                createDto,
                imageFile,
            });

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: EVENT_MESSAGES.SUCCESS_CREATE_EVENT,
                eventData: createdEvent,
            });
            
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown Error';
            console.error('Error in eventController.createEvent:', msg);
            next(error);
        };
    }

    
    async updateEventByHost(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "Unauthorized: User information missing" });
                return;
            }

            const body                  = req.body;
            const currentUserId: string = req.user.userId;
            const eventId: string       = req.params.eventId as string;
            const imageFile: Express.Multer.File | undefined = req.file;
            console.log('body :', body);
            console.log('imageFile :', imageFile);
            console.log('currentUserId :', currentUserId);
            console.log('eventId :', eventId);

            const updateEventDto: UpdateEventRequestDTO = mapCreateEventRequestToDto(req, currentUserId);

            const updatedEvent: EventResponseDTO = await this._eventServices.updateEventByHost({
                currentUserId,
                eventId,
                updateEventDto,
                imageFile
            });

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: EVENT_MESSAGES.SUCCESS_UPDATE_EVENT,
                updatedEvent,
            });
            
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown Error';
            console.error('Error in eventController.updateEventByHost:', msg);
            next(error);
        };
    }


    async updateEventByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "Unauthorized: Admin information missing" });
                return;
            }
            
            const body                  = req.body;
            const eventId: string       = req.params.eventId as string;
            const currentAdminId: string = req.user.userId;
            const imageFile: Express.Multer.File | undefined = req.file;
            console.log('body :', body);
            console.log('imageFile :', imageFile);
            console.log('eventId :', eventId);

            const updateEventDto: UpdateEventRequestDTO = mapCreateEventRequestToDto(req, currentAdminId);

            const updatedEvent: EventResponseDTO = await this._eventServices.updateEventByAdmin({
                eventId,
                updateEventDto,
                imageFile
            });

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: EVENT_MESSAGES.SUCCESS_UPDATE_EVENT,
                updatedEvent,
            });
            
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown Error';
            console.error('Error in eventController.updateEventByAdmin:', msg);
            next(error);
        };
    }


    async getAllEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const category = (req.query.category as string)?.trim() || "";
            const format = (req.query.format as string)?.trim() || "";
            const status = (req.query.status as string)?.trim() || "";
            const ticketType = (req.query.ticketType as string)?.trim() || "";
            const search = (req.query.search as string)?.trim() || "";

            const sortBy = allowedEventSortFields.includes(req.query.sortBy as string)
                ? (req.query.sortBy as string)
                : "createdAt";

            const sortOrder = (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

            const filters: GetEventsFilter = { 
                page, 
                limit, 
                category: category ? category as EventCategory : undefined,
                format: format ? format as EventFormat : undefined,
                status: status ? status as EventStatus : undefined,
                ticketType: ticketType ? ticketType as TicketType : undefined,
                search,
                sortBy,
                sortOrder
            };
            console.log('✅ Parsed filters for admin getAllEvents:', filters);

            const result: GetAllEventsResult = await this._eventServices.getAllEvents(filters);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                eventsData: result.events,
                pagination: result.pagination
            });

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown Error';
            console.error('Error in eventController.getAllEvents:', msg);
            next(error);
        };
    }


    async cancelEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "Unauthorized: User information missing" });
                return;
            }

            const { cancelReason } = req.body;
            const eventId = req.params.eventId as string; 
            const userId = req.user.userId as string; 

            const updatedStatus = await this._eventServices.cancelEvent({
                eventId,
                userId,
                cancelReason
            });

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Event cancelled successfully.",
                data: { status: updatedStatus }
            });

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown Error';
            console.error('Error in eventController.cancelEvent:', msg);
            next(error);
        };
    };


    async suspendEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const eventId = req.params.eventId as string;
            const suspendReason: string = req.body.reason;
            console.log('eventId :', eventId);
            console.log('suspendReason :', suspendReason);

            const updatedStatus: EventStatus | null = await this._eventServices.suspendEvent({eventId, suspendReason});

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: EVENT_MESSAGES.SUCCESS_SUSPEND_EVENT,
                updatedStatus
            });
            
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown Error';
            console.error('Error in eventController.suspendEvent:', msg);
            next(error);
        };
    }


    async publishEvent(req: Request, res: Response, next: NextFunction): Promise<void>{
        try {     
            if (!req.user || !req.user.userId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "Unauthorized: User information missing" });
                return;
            }

            const eventId = req.params.eventId as string;
            const userId = req.user.userId;
    
            await this._eventServices.publishEvent(eventId, userId);
    
            res.status(HTTP_STATUS.OK).json({
                message: EVENT_MESSAGES.SUCCESS_PUBLISH_EVENT,
            });

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown Error';
            console.error('Error in eventController.publishEvent:', msg);
            next(error);
        };
    }



    async deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const eventId = req.params.eventId as string;

            await this._eventServices.deleteEvent(eventId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: EVENT_MESSAGES.SUCCESS_DELETE_EVENT,
            });

            
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown Error';
            console.error('Error in eventController.deleteEvent:', msg);
            next(error);
        };
    }

 
    async getUserEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "Unauthorized: User information missing" });
                return;
            }
            const userId = req.user.userId;

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const category = (req.query.category as string)?.trim() || "";
            const format = (req.query.format as string)?.trim() || "";
            const status = (req.query.status as string)?.trim() || "";
            const ticketType = (req.query.ticketType as string)?.trim() || "";
            const search = (req.query.search as string)?.trim() || "";

            const sortBy = allowedEventSortFields.includes(req.query.sortBy as string)
                ? (req.query.sortBy as string)
                : "createdAt";

            const sortOrder: SortOrder = (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

            const filters: GetEventsFilter = { 
                page, 
                limit, 
                category: category ? category as EventCategory : undefined,
                format: format ? format as EventFormat : undefined,
                status: status ? status as EventStatus : undefined,
                ticketType: ticketType ? ticketType as TicketType : undefined,
                search,
                sortBy,
                sortOrder
            };
            console.log('✅ Parsed filters for getUserEvents:', filters);

            const result = await this._eventServices.getUserEvents({userId, filters});

            res.status(HTTP_STATUS.OK).json({
                success: true,
                eventsData: result.events,
                pagination: result.pagination
            });

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown Error';
            console.error('Error in eventController.getUserEvents:', msg);
            next(error);
        };
    }



    async getDiscoveryEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filters: GetPublicEventsFilter = mapEventDiscoveryQueryToFilters(req);
            console.log('filters for PUBLIC EVENTS:', req.query)
            
            const {eventsData, pagination}: GetDiscoveryEventsResult = await this._eventServices.getEventsForDiscovery(filters);

            console.log('PUBLIC EVENTS pagination:', pagination)
            
            res.status(HTTP_STATUS.OK).json({
                eventsData,
                pagination
            });
            
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown Error';
            console.error('Error in eventController.getDiscoveryEvents:', msg);
            next(error);
        };
    };


    async getTrendingEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 6;

            const trendingEvents = await this._eventServices.getTrendingEvents(limit);

            res.status(HTTP_STATUS.OK).json({ success: true, trendingEvents });

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown Error';
            console.error('Error in eventController.getTrendingEvents:', msg);
            next(error);
        };
    }



    async getEventDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const eventId = req.params.eventId as string;

            const eventDetails: EventResponseDTO = await this._eventServices.getEventDetails(eventId);

            res.status(HTTP_STATUS.OK).json({
                eventDetails
            });

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown Error';
            console.error('Error in eventController.getEventDetails:', msg);
            next(error);
        };
    }



    async getAllBookingsOfEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const eventId = req.params.eventId as string;

            const page    = parseInt(req.query.page  as string) || 1;
            const limit   = parseInt(req.query.limit as string) || 10;

            const status  = (req.query.status  as BookingStatus) || undefined;
            const search      = (req.query.search      as string)?.trim() || "";
            const eventFormat = (req.query.eventFormat as EventFormat)?.trim() || "";

            const sortBy: BookingSortField = ALLOWED_BOOKING_SORT_FIELDS.includes(req.query.sortBy as BookingSortField)
            ? (req.query.sortBy as BookingSortField)
            : "createdAt";

            const sortOrder = (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

            const filters: GetBookingsFilter = {
                eventId,
                page,
                limit,
                status:      status      ? (status as BookingStatus) : undefined,
                eventFormat: eventFormat ? (eventFormat as EventFormat) : undefined,
                search:      search      ? search : undefined,
                sortBy,
                sortOrder,
            };

            console.log("✅ Parsed filters for getAllBookingsOfEvent:", filters);

            // const result: GetBookingsResponseDTO = await this._bookingServices.getAllBookingsOfEvent(filters);
            const result: GetBookingsResponseDTO = await this._bookingServices.getBookingsList(filters);

            res.status(HTTP_STATUS.OK).json({
                success:    true,
                bookingsData:   result.bookings,
                pagination: result.pagination,
            });

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Unknown error";
            console.error("Error in EventController.getAllBookingsOfEvent:", msg);
            next(error);
        }
    }

}
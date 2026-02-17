// src/controllers/implementations/event.controller.ts

import { Request, Response, NextFunction } from "express";
import { IEventController } from "../interfaces/IEventController";
import { IEventManagementServices } from "@/services/event-services/interfaces/IEventManagementServices";
import { CreateEventDTO, EventResponseDTO } from "@/dtos/event.dto";
import { HttpResponse } from "@/constants/responseMessages.constants";
import { HttpStatus } from "@/constants/statusCodes.constants";
import { mapCreateEventRequestToDto } from "@/mappers/event.mapper";
import { EVENT_CATEGORY, EVENT_FORMAT, EVENT_STATUS, GetEventsFilter, TICKET_TYPE } from "@/types/event.types";





export class EventController implements IEventController {
    constructor(
        private _eventServices: IEventManagementServices,
    ) {
        
    }

    async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = req.body;
            const imageFile: Express.Multer.File | undefined = req.file;
            const currentUserId: string = req.user.userId;
            console.log('body :', body);
            console.log('imageFile :', imageFile);
            console.log('currentUserId :', currentUserId);

            const createDto: CreateEventDTO = mapCreateEventRequestToDto(req);

            const createdEvent: EventResponseDTO = await this._eventServices.createEvent({
                createDto,
                imageFile,
                // currentUserId
            });

            res.status(HttpStatus.CREATED).json({
                success: true,
                message: HttpResponse.SUCCESS_CREATE_EVENT,
                eventData: createdEvent,
            });
            
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown Error';
            console.error('Error in eventController.createEvent:', msg);
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

            const allowedSortFields = [
                "createdAt",
                "startDateTime",
                "endDateTime",
                "title",
                "ticketPrice",
                "grossTicketRevenue",
                "capacity",
                "soldTickets",
            ];
            const sortBy = allowedSortFields.includes(req.query.sortBy as string)
                ? (req.query.sortBy as string)
                : "createdAt";

            const sortOrder = (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

            const filters: GetEventsFilter = { 
                page, 
                limit, 
                category: category ? category as EVENT_CATEGORY : undefined,
                format: format ? format as EVENT_FORMAT : undefined,
                status: status ? status as EVENT_STATUS : undefined,
                ticketType: ticketType ? ticketType as TICKET_TYPE : undefined,
                search,
                sortBy,
                sortOrder
            };
            console.log('✅ Parsed filters for admin getAllEvents:', filters);

            const result = await this._eventServices.getAllEvents(filters);

            res.status(HttpStatus.OK).json({
                success: true,
                eventsData: result.events,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    totalCount: result.totalCount,
                    totalPages: result.totalPages,
                },
            });

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown Error';
            console.error('Error in eventController.getAllEvents:', msg);
            next(error);
        };
    }


    async suspendEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const eventId: string = req.params.eventId;
            const suspendReason: string = req.params.reason;
            console.log('eventId :', eventId);
            console.log('suspendReason :', suspendReason);

            const updatedStatus: EVENT_STATUS | undefined = await this._eventServices.suspendEvent({eventId, suspendReason});

            res.status(HttpStatus.OK).json({
                success: true,
                message: HttpResponse.SUCCESS_SUSPEND_EVENT,
                updatedStatus
            });
            
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown Error';
            console.error('Error in eventController.suspendEvent:', msg);
            next(error);
        };
    }


    async deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const eventId = req.params.eventId;

            await this._eventServices.deleteEvent(eventId);

            res.status(HttpStatus.OK).json({
                success: true,
                message: HttpResponse.SUCCESS_DELETE_EVENT,
            });

            
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown Error';
            console.error('Error in eventController.deleteEvent:', msg);
            next(error);
        };
    }


}
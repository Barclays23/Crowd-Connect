// src/controllers/implementations/event.controller.ts

import { Request, Response, NextFunction } from "express";
import { IEventController } from "../interfaces/IEventController";
import { IEventManagementServices } from "@/services/event-services/interfaces/IEventManagementServices";
import { CreateEventDTO, EventResponseDTO } from "@/dtos/event.dto";
import { HttpResponse } from "@/constants/responseMessages.constants";
import { HttpStatus } from "@/constants/statusCodes.constants";
import { mapCreateEventRequestToDto } from "@/mappers/event.mapper";





export class EventController implements IEventController {
    constructor(private _eventServices: IEventManagementServices) {
        
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
}
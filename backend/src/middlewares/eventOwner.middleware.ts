// backend/src/middlewares/eventOwner.middleware.ts

import { Request, Response, NextFunction } from "express";
import { IEventRepository }               from "@/repositories/interfaces/IEventRepository";
import { EventRepository }                from "@/repositories/implementations/event.repository";
import { createHttpError }                from "@/utils/httpError.utils";
import { EventEntity }                    from "@/entities/event.entity";
import { HTTP_STATUS } from "@/constants/http-status.constants";


declare global {
    namespace Express {
        interface Request {
            ownedEvent?: EventEntity;
        }
    }
}

const eventRepo: IEventRepository = new EventRepository();

export async function requireEventOwner(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const eventId = req.params?.eventId as string;
        const userId  = req.user?.userId;

        if (!eventId) {
            throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Event ID is required.");
        }

        const event = await eventRepo.getEventById(eventId);

        if (!event) {
            throw createHttpError(HTTP_STATUS.NOT_FOUND, "Event not found.");
        }

        if (event.organizer.hostId !== userId) {
            throw createHttpError(
                HTTP_STATUS.FORBIDDEN,
                "You do not have permission to manage this event."
            );
        }

        // Attach to req so the service can use it without re-fetching
        req.ownedEvent = event;

        next();

    } catch (error) {
        next(error);
    }
}
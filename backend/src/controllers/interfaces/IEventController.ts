import { Request, Response, NextFunction } from "express";




export interface IEventController {
    createEvent(req: Request, res: Response, next: NextFunction): Promise<void>
    publishEvent(req: Request, res: Response, next: NextFunction): Promise<void>
    updateEventByHost(req: Request, res: Response, next: NextFunction): Promise<void>
    updateEventByAdmin(req: Request, res: Response, next: NextFunction): Promise<void>
    suspendEvent(req: Request, res: Response, next: NextFunction): Promise<void>
    cancelEvent(req: Request, res: Response, next: NextFunction): Promise<void>
    deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void>

    getAllEvents(req: Request, res: Response, next: NextFunction): Promise<void>
    getUserEvents(req: Request, res: Response, next: NextFunction): Promise<void>
    getDiscoveryEvents(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTrendingEvents(req: Request, res: Response, next: NextFunction): Promise<void>;
    getOrganiserEvents(req: Request, res: Response, next: NextFunction): Promise<void>

    getEventDetails(req: Request, res: Response, next: NextFunction): Promise<void>;

    getAllBookingsOfEvent(req: Request, res: Response, next: NextFunction): Promise<void>;
}
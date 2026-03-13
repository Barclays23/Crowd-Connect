import { Request, Response, NextFunction } from "express";




export interface IEventController {
    createEvent(req: Request, res: Response, next: NextFunction): Promise<void>
    getAllEvents(req: Request, res: Response, next: NextFunction): Promise<void>
    suspendEvent(req: Request, res: Response, next: NextFunction): Promise<void>
    cancelEvent(req: Request, res: Response, next: NextFunction): Promise<void>
    deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void>
    getUserEvents(req: Request, res: Response, next: NextFunction): Promise<void>
    publishEvent(req: Request, res: Response, next: NextFunction): Promise<void>
    updateEvent(req: Request, res: Response, next: NextFunction): Promise<void>
    getDiscoveryEvents(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEventDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
}
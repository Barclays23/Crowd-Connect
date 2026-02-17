import { Request, Response, NextFunction } from "express";




export interface IEventController {
    createEvent(req: Request, res: Response, next: NextFunction): Promise<void>
    getAllEvents(req: Request, res: Response, next: NextFunction): Promise<void>
    suspendEvent(req: Request, res: Response, next: NextFunction): Promise<void>
    deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void>
    
}
import { Request, Response, NextFunction } from "express";




export interface IEventController {
    createEvent(req: Request, res: Response, next: NextFunction): Promise<void>
}
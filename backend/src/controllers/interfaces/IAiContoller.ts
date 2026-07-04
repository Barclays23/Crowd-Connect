import { NextFunction, Request, Response } from "express";




export interface IAiController {
    generateEventPoster(req: Request, res: Response, next: NextFunction): Promise<void>
}
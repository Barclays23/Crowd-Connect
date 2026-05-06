import { NextFunction, Request, Response } from "express";




export interface ISettingsController {
    getSettings(req: Request, res: Response, next: NextFunction): Promise<void>
    updateSettings(req: Request, res: Response, next: NextFunction): Promise<void>
}
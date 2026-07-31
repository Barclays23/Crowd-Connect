import { NextFunction, Request, Response } from "express";




export interface ISettingsController {
    getOperationalSettings(req: Request, res: Response, next: NextFunction): Promise<void>
    getTermsAndConditions(req: Request, res: Response, next: NextFunction): Promise<void>

    updateOperationalSettings(req: Request, res: Response, next: NextFunction): Promise<void>
    updateTerms(req: Request, res: Response, next: NextFunction): Promise<void>
}
import { NextFunction, Request, Response } from "express";


export interface IHostController {
    applyHostUpgrade (req: Request, res: Response, next: NextFunction): Promise<void>
    getAllHosts (req: Request, res: Response, next: NextFunction): Promise<void>
}
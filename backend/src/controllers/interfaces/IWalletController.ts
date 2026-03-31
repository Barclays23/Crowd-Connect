import { Request, Response, NextFunction } from "express";




export interface IWalletController {
    getWalletOverview(req: Request, res: Response, next: NextFunction): Promise<void>

    getTransactions(req: Request, res: Response, next: NextFunction): Promise<void>
}
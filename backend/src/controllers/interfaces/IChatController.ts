// backend/src/controllers/interfaces/IChatController.ts
import { NextFunction, Request, Response } from "express";




export interface IChatController {
    askQuestion(req: Request, res: Response, next: NextFunction): Promise<void>;
}
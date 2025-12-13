// backend/src/controllers/interfaces/IUserController.ts
import { Request, Response, NextFunction } from 'express';


export interface IUserController {
    getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
}
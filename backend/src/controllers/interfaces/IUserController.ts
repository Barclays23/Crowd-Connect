// backend/src/controllers/interfaces/IUserController.ts
import { Request, Response, NextFunction } from 'express';


export interface IUserController {
    getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    editUserByAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
    // editProfile(req: Request, res: Response, next: NextFunction): Promise<void>
}
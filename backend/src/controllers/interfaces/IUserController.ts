// backend/src/controllers/interfaces/IUserController.ts
import { Request, Response, NextFunction } from 'express';


export interface IUserController {
    getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    editUserBasicInfo(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateProfilePicture(req: Request, res: Response, next: NextFunction): Promise<void>;

    
    getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    createUserByAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
    editUserByAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
    toggleUserBlock(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    // editProfile(req: Request, res: Response, next: NextFunction): Promise<void>
}
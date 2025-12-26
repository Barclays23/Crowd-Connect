import { Request, Response, NextFunction } from "express";

export interface IAuthController {
    signIn(req: Request, res: Response, next: NextFunction): Promise<void>
    signUp(req: Request, res: Response, next: NextFunction): Promise<void>

    requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void>
    validateResetLink(req: Request, res: Response, next: NextFunction): Promise<void>
    resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>

    verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void>
    resendOtp(req: Request, res: Response, next: NextFunction): Promise<void>

    refreshAccessToken(req: Request, res: Response, next: NextFunction): Promise<void>

    logout(req: Request, res: Response, next: NextFunction): Promise<void>
    
    getAuthUser(req: Request, res: Response, next: NextFunction): Promise<void>
}
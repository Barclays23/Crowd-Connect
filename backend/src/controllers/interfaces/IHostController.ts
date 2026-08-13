import { NextFunction, Request, Response } from "express";


export interface IHostController {
    applyHostRoleUpgrade (req: Request, res: Response, next: NextFunction): Promise<void>
    manageHostApplication (req: Request, res: Response, next: NextFunction): Promise<void>
    manageHostPermission (req: Request, res: Response, next: NextFunction): Promise<void>
    
    getAllHosts (req: Request, res: Response, next: NextFunction): Promise<void>
    getOrganiserProfile (req: Request, res: Response, next: NextFunction): Promise<void>

    updateHostLogoByHost (req: Request, res: Response, next: NextFunction): Promise<void>
    updateHostDetailsByHost (req: Request, res: Response, next: NextFunction): Promise<void>
    updateHostDetailsByAdmin (req: Request, res: Response, next: NextFunction): Promise<void>
    updateHostLogoByAdmin(req: Request, res: Response, next: NextFunction): Promise<void>

    convertToHost(req: Request, res: Response, next: NextFunction): Promise<void>

}
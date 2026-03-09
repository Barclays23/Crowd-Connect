import { Request, Response, NextFunction } from "express";




export interface IBookingController {
    initiateBooking(req: Request, res: Response, next: NextFunction): Promise<void>
    getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void>
    getAdminBookings(req: Request, res: Response, next: NextFunction): Promise<void>
    getBookingById(req: Request, res: Response, next: NextFunction): Promise<void>
    cancelBookingByUser(req: Request, res: Response, next: NextFunction): Promise<void>
}
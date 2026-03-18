import { Request, Response, NextFunction } from "express";




export interface IBookingController {
    initiateBooking(req: Request, res: Response, next: NextFunction): Promise<void>
    // can I use this same for booking payment and host role upgrade payment? or need separate?
    verifyAndConfirmPayment(req: Request, res: Response, next: NextFunction): Promise<void>
    getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void>
    getAdminBookings(req: Request, res: Response, next: NextFunction): Promise<void>
    getBookingById(req: Request, res: Response, next: NextFunction): Promise<void>
    cancelBookingByUser(req: Request, res: Response, next: NextFunction): Promise<void>
    cancelBookingByAdmin(req: Request, res: Response, next: NextFunction): Promise<void>
}
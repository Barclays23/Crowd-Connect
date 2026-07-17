import { NextFunction, Request, Response } from "express";




export interface IReviewController {
    submitReview(req: Request, res: Response, next: NextFunction): Promise<void>
    editReview(req: Request, res: Response, next: NextFunction): Promise<void>
    deleteReview(req: Request, res: Response, next: NextFunction): Promise<void>
    getHostReviews(req: Request, res: Response, next: NextFunction): Promise<void>
}
// src/controllers/implementations/review.controller.ts
import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { IReviewController } from "@/controllers/interfaces/IReviewContoller";
import { IReviewService } from "@/services/review-services/interfaces/IReviewService";
import { UserRole } from "@/constants/user-system.constants";




export class ReviewController implements IReviewController {

    constructor(
        private _reviewService: IReviewService
    ) {}


    async submitReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.userId;

            await this._reviewService.submitReview(userId, req.body);
            
            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                // message: "Review submitted successfully!",
                message: "Review submitted successfully! Thank you for your feedback.",
            });

        } catch (error) {
            next(error);
        }
    }




    async editReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.userId as string;
            const reviewId = req.params.reviewId as string;
            
            await this._reviewService.editReview(userId, reviewId, req.body);
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Review updated successfully!",
            });

        } catch (error) {
            next(error);
        }
    }



    async deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId    = req.user!.userId as string;
            const role      = req.user!.role as UserRole;
            const reviewId  = req.params.reviewId as string;
            
            await this._reviewService.deleteReview(userId, role, reviewId);
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Review deleted successfully!",
            });
            
        } catch (error) {
            next(error);
        }
    }




    async getHostReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const hostId = req.params.hostId as string;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const data = await this._reviewService.getReviewsForHost(hostId, page, limit);
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Reviews fetched successfully",
                data: data.reviews,
                pagination: data.pagination
            });

        } catch (error) {
            next(error);
        }
    }
}

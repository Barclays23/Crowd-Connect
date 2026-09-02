// backend/src/routes/review.routes.ts
import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { USER_ROLES } from "@/constants/user-system.constants";
import { validateRequest } from "@/middlewares/validate.middleware";
import { EditReviewSchema, SubmitReviewSchema } from "@/schemas/review.schema";
import { REVIEW_ROUTES } from "@/constants/routes.constants";
import { reviewController } from "@/container/dependencies";




export const reviewRouter = Router();



// Protected routes (for managing reviews and rating)
reviewRouter.post(REVIEW_ROUTES.SUBMIT_REVIEW, authenticate, authorize(USER_ROLES.USER, USER_ROLES.HOST), validateRequest({ body: SubmitReviewSchema }),reviewController.submitReview.bind(reviewController));

reviewRouter.put(REVIEW_ROUTES.MANAGE_REVIEW, authenticate, authorize(USER_ROLES.USER, USER_ROLES.HOST), validateRequest({ body: EditReviewSchema }),reviewController.editReview.bind(reviewController));

reviewRouter.delete(REVIEW_ROUTES.MANAGE_REVIEW, authenticate, authorize(USER_ROLES.USER, USER_ROLES.HOST, USER_ROLES.ADMIN), reviewController.deleteReview.bind(reviewController));

reviewRouter.get(REVIEW_ROUTES.MY_REVIEWS, authenticate, authorize(USER_ROLES.USER, USER_ROLES.HOST), reviewController.getMyReviews.bind(reviewController));



// Public route: organiser reviews (for public events for users)
reviewRouter.get(REVIEW_ROUTES.HOST_REVIEWS, reviewController.getHostReviews.bind(reviewController));

// Public route: specific event reviews (for hosts)
reviewRouter.get(REVIEW_ROUTES.EVENT_REVIEWS, reviewController.getEventReviews.bind(reviewController));



export default reviewRouter;
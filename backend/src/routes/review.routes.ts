// backend/src/routes/review.routes.ts
import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { USER_ROLES } from "@/constants/user-system.constants";
import { ReviewController } from "@/controllers/implementations/review.controller";
import { ReviewService } from "@/services/review-services/implementations/review.service";
import { UserRepository } from "@/repositories/implementations/user.repository";
import { BookingRepository } from "@/repositories/implementations/booking.repository";
import { ReviewRepository } from "@/repositories/implementations/review.repository";
import { EventRepository } from "@/repositories/implementations/event.repository";
import { validateRequest } from "@/middlewares/validate.middleware";
import { EditReviewSchema, SubmitReviewSchema } from "@/schemas/review.schema";




// REPOSITORIES
const userRepo          = new UserRepository();
const bookingRepo       = new BookingRepository()
const eventRepo         = new EventRepository()
const reviewRepo        = new ReviewRepository()



// SERVICES
const reviewService = new ReviewService(reviewRepo, bookingRepo, eventRepo, userRepo)



// CONTROLLERS
const reviewController = new ReviewController(reviewService)


// ROUTER
export const reviewRouter = Router();



// Protected routes (for managing reviews and rating)
reviewRouter.post("/", authenticate,
    authorize(USER_ROLES.USER, USER_ROLES.HOST), 
    validateRequest({ body: SubmitReviewSchema }),
    reviewController.submitReview.bind(reviewController)
);

reviewRouter.put(
    "/:reviewId", 
    authorize(USER_ROLES.USER, USER_ROLES.HOST), 
    validateRequest({ body: EditReviewSchema }),
    reviewController.editReview.bind(reviewController)
);

reviewRouter.delete(
    "/:reviewId", 
    authorize(USER_ROLES.USER, USER_ROLES.HOST, USER_ROLES.ADMIN), 
    reviewController.deleteReview.bind(reviewController)
);


// Public route: organiser reviews (for public events for users)
reviewRouter.get("/host/:hostId", reviewController.getHostReviews.bind(reviewController));

// Public route: specific event reviews (for hosts)
reviewRouter.get("/events/:eventId", reviewController.getEventReviews.bind(reviewController));



export default reviewRouter;
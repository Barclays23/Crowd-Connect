// backend/src/routes/review.routes.ts
import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { USER_ROLES } from "@/constants/user-system.constants";
import { ReviewController } from "@/controllers/implementations/review.controller";
import { ReviewService } from "@/services/review-services/implementations/review.service";
import { WalletService } from "@/services/wallet-services/implementations/wallet.service";
import { TransactionRepository } from "@/repositories/implementations/transaction.repository";
import { UserRepository } from "@/repositories/implementations/user.repository";
import { BookingRepository } from "@/repositories/implementations/booking.repository";
import { ReviewRepository } from "@/repositories/implementations/review.repository";
import { EventRepository } from "@/repositories/implementations/event.repository";
import { validateRequest } from "@/middlewares/validate.middleware";
import { EditReviewSchema, SubmitReviewSchema } from "@/schemas/review.schema";




// REPOSITORIES
const userRepo          = new UserRepository();
const transactionRepo   = new TransactionRepository();
const bookingRepo       = new BookingRepository()
const eventRepo         = new EventRepository()
const reviewRepo        = new ReviewRepository()



// SERVICES
const walletService = new WalletService(userRepo, transactionRepo);
const reviewService = new ReviewService(reviewRepo, bookingRepo, eventRepo, userRepo, walletService)



// CONTROLLERS
const reviewController = new ReviewController(reviewService)


// ROUTER
export const reviewRouter = Router();



// Public route to see host reviews (for public events for users)
reviewRouter.get("/host/:hostId", reviewController.getHostReviews.bind(reviewController));


// Protected routes (for managing reviews and rating)
reviewRouter.post("/", 
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




export default reviewRouter;
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
import { REVIEW_ROUTES } from "@/constants/routes.constants";
import { BadWordsFilterService } from "@/services/profanity-services/implementations/BadWordsFilterService";
import { OpenAIProfanityFilterService } from "@/services/profanity-services/implementations/OpenAIProfanityFilterService";
import { GeminiProfanityFilterService } from "@/services/profanity-services/implementations/GeminiProfanityFilterService";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";



// AI CONFIGURATIONS
const genAI     = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// const openAI    = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });



// REPOSITORIES
const userRepo          = new UserRepository();
const bookingRepo       = new BookingRepository();
const eventRepo         = new EventRepository();
const reviewRepo        = new ReviewRepository();



// PROFANITY FILTER SERVICES
const profanityFilter   = new GeminiProfanityFilterService(genAI);
// const profanityFilter   = new OpenAIProfanityFilterService(openAI);
// const profanityFilter   = new BadWordsFilterService();



// REVIEW SERVICE
const reviewService     = new ReviewService(reviewRepo, bookingRepo, eventRepo, userRepo, profanityFilter);



// CONTROLLERS
const reviewController = new ReviewController(reviewService)


// ROUTER
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
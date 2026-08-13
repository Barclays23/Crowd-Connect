// backend/src/repositories/interfaces/IReviewRepository.ts

import { AdminPopulatedReviewEntity, CreateReviewInput, PopulatedReviewEntity, ReviewEntity } from "@/entities/review.entity"
import { GetReviewsAdminFilter, GetReviewsFilter } from "@/types/review.types"



export interface IReviewRepository {
    createReview(input: CreateReviewInput): Promise<ReviewEntity>

    updateReview(reviewId: string, rating: number, reviewText?: string): Promise<ReviewEntity | null>

    deleteReview(reviewId: string): Promise<void>;

    // finding reviews of specific user /organizer/ event
    findReviews(filters: GetReviewsFilter): Promise<{ reviews: PopulatedReviewEntity[]; totalCount: number }>

    findAllReviewsForAdmin(filters: GetReviewsAdminFilter): Promise<{ reviews: AdminPopulatedReviewEntity[]; totalCount: number }>;

    getReviewById(reviewId: string): Promise<ReviewEntity | null>

    getReviewByBookingId(bookingId: string): Promise<ReviewEntity | null>

    getReviewByUserAndEvent(userId: string, eventId: string): Promise<ReviewEntity | null>;

    getAverageRatingForEvent(eventId: string): Promise<{ average: number, total: number }>

    getAverageRatingForHost(hostId: string): Promise<{ average: number, total: number }>

}
// backend/src/repositories/interfaces/IReviewRepository.ts

import { CreateReviewInput, PopulatedReviewEntity, ReviewEntity } from "@/entities/review.entity"
import { GetReviewsFilter } from "@/types/review.types"



export interface IReviewRepository {
    createReview(input: CreateReviewInput): Promise<ReviewEntity>

    updateReview(reviewId: string, rating: number, reviewText?: string): Promise<ReviewEntity | null>

    deleteReview(reviewId: string): Promise<void>;

    findReviews(filters: GetReviewsFilter): Promise<{ reviews: PopulatedReviewEntity[]; totalCount: number }>

    getReviewById(reviewId: string): Promise<ReviewEntity | null>

    getReviewByBookingId(bookingId: string): Promise<ReviewEntity | null>

    getReviewByUserAndEvent(userId: string, eventId: string): Promise<ReviewEntity | null>;

    getAverageRatingForEvent(eventId: string): Promise<{ average: number, total: number }>

    getAverageRatingForHost(hostId: string): Promise<{ average: number, total: number }>

}
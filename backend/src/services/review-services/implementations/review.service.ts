// backend/src/services/review-services/implementations/review.service.ts
import { IReviewRepository } from "@/repositories/interfaces/IReviewRepository";
import { IBookingRepository } from "@/repositories/interfaces/IBookingRepository";
import { IEventRepository } from "@/repositories/interfaces/IEventRepository";
import { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import { IReviewService } from "@/services/review-services/interfaces/IReviewService";
import { 
    SubmitReviewRequestDTO, 
    EditReviewRequestDTO, 
    GetReviewsResponseDTO, 
    ReviewResponseDTO
} from "@/dtos/review.dto";
import { createHttpError } from "@/utils/httpError.utils";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { CreateReviewInput, PopulatedReviewEntity, ReviewEntity } from "@/entities/review.entity";
import { BookingEntityPopulated } from "@/entities/booking.entity";
import { 
    mapAdminPopulatedReviewEntityToDTO,
    mapPopulatedReviewEntityToResponseDTO, 
    mapToCreateReviewInput 
} from "@/mappers/review.mapper";
import { EVENT_MESSAGES } from "@/constants/messages.constants";
import { USER_ROLES } from "@/constants/user-system.constants";
import { GetReviewsAdminFilter } from "@/types/review.types";
import { EventEntity } from "@/entities/event.entity";
import { IProfanityFilterService } from "@/services/profanity-services/interfaces/IProfanityFilterService";




export class ReviewService implements IReviewService {

    constructor(
        private _reviewRepository   : IReviewRepository,
        private _bookingRepository  : IBookingRepository,
        private _eventRepository    : IEventRepository,
        private _userRepository     : IUserRepository,
        private _profanityFilter    : IProfanityFilterService
    ) {}


    async submitReview(userId: string, reviewDto: SubmitReviewRequestDTO): Promise<void> {
        const booking: BookingEntityPopulated | null = await this._bookingRepository.getBookingById(reviewDto.bookingId);
        if (!booking || booking.user.userId !== userId) {
            throw createHttpError(HTTP_STATUS.NOT_FOUND, "Booking not found or unauthorized.");
        }

        const hasCheckedInEvent: boolean = await this._bookingRepository.hasUserCheckedInEvent(userId, booking.event.eventId);
        if (!hasCheckedInEvent) {
            throw createHttpError(HTTP_STATUS.BAD_REQUEST, "You can only review events you have attended.");
        }

        // Check user already reviewed this event
        const existingReview = await this._reviewRepository.getReviewByUserAndEvent(userId, booking.event.eventId);
        if (existingReview) {
            throw createHttpError(HTTP_STATUS.BAD_REQUEST, "You have already reviewed this event.");
        }

        const isOffensive: boolean = await this._profanityFilter.isProfane(reviewDto.reviewText);
        if (isOffensive) {
            throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Review violates our guidelines. Please edit and resubmit.");
        }

        const eventEntity: EventEntity | null = await this._eventRepository.getEventById(booking.event.eventId);
        if (!eventEntity) {
            throw createHttpError(HTTP_STATUS.NOT_FOUND, EVENT_MESSAGES.EVENT_NOT_FOUND);
        }
        const hostId: string = eventEntity.organizer.hostId;

        const createInput: CreateReviewInput = mapToCreateReviewInput({
            userId      : userId,
            eventId     : booking.event.eventId,
            hostId      : hostId,
            reviewDto   : reviewDto,
        });

        const newReview: ReviewEntity = await this._reviewRepository.createReview(createInput);

        await this._updateEventAndHostRatingAggregates(booking.event.eventId, hostId);

    }



    async editReview(userId: string, reviewId: string, reviewDto: EditReviewRequestDTO): Promise<void> {
        const review: ReviewEntity | null = await this._reviewRepository.getReviewById(reviewId);
        if (!review || review.userRef !== userId) {
            throw createHttpError(HTTP_STATUS.NOT_FOUND, "Review not found or unauthorized.");
        }

        const isOffensive: boolean = await this._profanityFilter.isProfane(reviewDto.reviewText);
        if (isOffensive) {
            throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Please remove language that violates our guidelines.");
        }

        await this._reviewRepository.updateReview(reviewId, reviewDto.rating, reviewDto.reviewText);

        // Recalculate aggregates for the Event and Host to update their stars
        await this._updateEventAndHostRatingAggregates(review.eventRef, review.hostRef);
    }



    async deleteReview(userId: string, role: string, reviewId: string): Promise<void> {
        const review = await this._reviewRepository.getReviewById(reviewId);
        
        if (!review) {
            throw createHttpError(HTTP_STATUS.NOT_FOUND, "Review not found.");
        }

        // If the requester is NOT an admin, enforce strict user rules
        if (role !== USER_ROLES.ADMIN) {
            if (review.userRef !== userId) {
                throw createHttpError(HTTP_STATUS.FORBIDDEN, "You are not authorized to delete this review.");
            }
        }

        await this._reviewRepository.deleteReview(reviewId);

        // Recalculate aggregates for the Event and Host to update their stars
        await this._updateEventAndHostRatingAggregates(review.eventRef, review.hostRef);
    }



    async getReviewsForUser(userId: string, page: number, limit: number): Promise<GetReviewsResponseDTO> {
        const result: {
            reviews: PopulatedReviewEntity[];
            totalCount: number;
        } = await this._reviewRepository.findReviews({ page, limit, userId });

        const userReviews: ReviewResponseDTO[] = result.reviews.map(mapPopulatedReviewEntityToResponseDTO);
        
        return {
            reviews: userReviews,
            pagination: {
                totalCount: result.totalCount,
                limit,
                currentPage: page,
                totalPages: Math.ceil(result.totalCount / limit)
            }
        };
    }



    async getReviewsForHost(hostId: string, page: number, limit: number): Promise<GetReviewsResponseDTO> {
        const result = await this._reviewRepository.findReviews({ page, limit, hostId });
        
        return {
            reviews: result.reviews.map(mapPopulatedReviewEntityToResponseDTO),
            pagination: {
                totalCount: result.totalCount,
                limit,
                currentPage: page,
                totalPages: Math.ceil(result.totalCount / limit)
            }
        };
    }



    async getReviewsForEvent(eventId: string, page: number, limit: number): Promise<GetReviewsResponseDTO> {
        const result = await this._reviewRepository.findReviews({ page, limit, eventId });
        
        return {
            reviews: result.reviews.map(mapPopulatedReviewEntityToResponseDTO),
            pagination: {
                totalCount: result.totalCount,
                limit,
                currentPage: page,
                totalPages: Math.ceil(result.totalCount / limit)
            }
        };
    }



    async getAllReviewsForAdmin(filters: GetReviewsAdminFilter): Promise<GetReviewsResponseDTO> {
        const {reviews, totalCount} = await this._reviewRepository.findAllReviewsForAdmin(filters);

        const populatedReviews: ReviewResponseDTO[] = reviews.map(mapAdminPopulatedReviewEntityToDTO);
        
        return {
            reviews: populatedReviews,
            pagination: {
                totalCount: totalCount,
                limit: filters.limit,
                currentPage: filters.page,
                totalPages: Math.ceil(totalCount / filters.limit)
            }
        };
    }



    // update the event ratings stats and host rating stats
    private async _updateEventAndHostRatingAggregates(eventId: string, hostId: string): Promise<void> {

        const eventRatingStats = await this._reviewRepository.getAverageRatingForEvent(eventId);
        const hostRatingStats = await this._reviewRepository.getAverageRatingForHost(hostId);

        await this._eventRepository.updateEventRatingStats(eventId, eventRatingStats.average, eventRatingStats.total);
        await this._userRepository.updateHostRatingStats(hostId, hostRatingStats.average, hostRatingStats.total);
    }
}
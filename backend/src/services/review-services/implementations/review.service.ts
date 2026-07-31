// backend/src/services/review-services/implementations/review.service.ts
// const BadWords = require("bad-words");
// import BadWordsFilter from "bad-words";
// import BadWords from "bad-words";
// import Filter from "bad-words";
import { Filter } from "bad-words";


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
import { CreateReviewInput, ReviewEntity } from "@/entities/review.entity";
import { BookingEntityPopulated } from "@/entities/booking.entity";
import { 
    mapAdminPopulatedReviewEntityToDTO,
    mapPopulatedReviewEntityToResponseDTO, 
    mapToCreateReviewInput 
} from "@/mappers/review.mapper";
import { EVENT_MESSAGES } from "@/constants/messages.constants";
import { USER_ROLES } from "@/constants/user-system.constants";
import { GetReviewsAdminFilter } from "@/types/review.types";




// interface IProfanityFilter {
//     isProfane(text: string): boolean;
// }


export class ReviewService implements IReviewService {
    // private profanityFilter: IProfanityFilter;
    private profanityFilter: Filter;

    constructor(
        private _reviewRepository: IReviewRepository,
        private _bookingRepository: IBookingRepository,
        private _eventRepository: IEventRepository,
        private _userRepository: IUserRepository,
    ) {
        // this.profanityFilter = new BadWords();
        this.profanityFilter = new Filter();
    }


    async submitReview(userId: string, reviewDto: SubmitReviewRequestDTO): Promise<void> {
        if (reviewDto.reviewText && this.profanityFilter.isProfane(reviewDto.reviewText)) {
            throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Please remove offensive language from your review.");
        }

        const booking: BookingEntityPopulated | null = await this._bookingRepository.getBookingById(reviewDto.bookingId);
        if (!booking || booking.user.userId !== userId) {
            throw createHttpError(HTTP_STATUS.NOT_FOUND, "Booking not found or unauthorized.");
        }

        // if (booking.bookingStatus !== BOOKING_STATUSES.ATTENDED) {
        //     throw createHttpError(HTTP_STATUS.BAD_REQUEST, "You can only review events you have attended.");
        // }

        const hasAttended: boolean = await this._bookingRepository.hasUserAttendedEvent(userId, booking.event.eventId);
        if (!hasAttended) {
            throw createHttpError(HTTP_STATUS.BAD_REQUEST, "You can only review events you have attended.");
        }

        // Check user already reviewed this event
        const existingReview = await this._reviewRepository.getReviewByUserAndEvent(userId, booking.event.eventId);
        if (existingReview) {
            throw createHttpError(HTTP_STATUS.BAD_REQUEST, "You have already reviewed this event.");
        }

        const eventEntity = await this._eventRepository.getEventById(booking.event.eventId);
        if (!eventEntity) {
            throw createHttpError(HTTP_STATUS.NOT_FOUND, EVENT_MESSAGES.EVENT_NOT_FOUND);
        }
        const hostId = eventEntity.organizer.hostId;

        const createInput: CreateReviewInput = mapToCreateReviewInput({
            userId      : userId,
            eventId     : booking.event.eventId,
            hostId      : hostId,
            reviewDto   : reviewDto,
        });

        const newReview = await this._reviewRepository.createReview(createInput);

        await this._updateEventAndHostAggregates(booking.event.eventId, hostId);

    }



    async editReview(userId: string, reviewId: string, dto: EditReviewRequestDTO): Promise<void> {
        if (dto.reviewText && this.profanityFilter.isProfane(dto.reviewText)) {
            throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Please remove offensive language from your review.");
        }

        const review: ReviewEntity | null = await this._reviewRepository.getReviewById(reviewId);
        if (!review || review.userRef !== userId) {
            throw createHttpError(HTTP_STATUS.NOT_FOUND, "Review not found or unauthorized.");
        }

        await this._reviewRepository.updateReview(reviewId, dto.rating, dto.reviewText);

        // ARCHITECTURE FIX: Update Event and Host using their own repositories
        await this._updateEventAndHostAggregates(review.eventRef, review.hostRef);
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
        await this._updateEventAndHostAggregates(review.eventRef, review.hostRef);
    }



    // update the event ratings stats and host rating stats
    private async _updateEventAndHostAggregates(eventId: string, hostId: string): Promise<void> {

        const eventRatingStats = await this._reviewRepository.getAverageRatingForEvent(eventId);
        const hostRatingStats = await this._reviewRepository.getAverageRatingForHost(hostId);

        await this._eventRepository.updateEventRatingStats(eventId, eventRatingStats.average, eventRatingStats.total);
        await this._userRepository.updateHostRatingStats(hostId, hostRatingStats.average, hostRatingStats.total);
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
}
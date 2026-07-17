// backend/src/mappers/review.mapper.ts

import { ReviewResponseDTO, SubmitReviewRequestDTO } from "@/dtos/review.dto";
import { CreateReviewInput, PopulatedReviewEntity, ReviewEntity } from "@/entities/review.entity";
import { IReviewModel, IReviewPopulatedUser, MapCreateReviewParams } from "@/types/review.types";
import { Types } from "mongoose";




export const mapReviewDocToEntity = (doc: IReviewModel): ReviewEntity => {
    return {
        reviewId    : doc._id.toString(),
        eventRef    : doc.eventRef.toString(),
        hostRef     : doc.hostRef.toString(),
        userRef     : doc.userRef.toString(),
        bookingRef  : doc.bookingRef.toString(),

        rating          : doc.rating,
        reviewText      : doc.reviewText,
        isRewardClaimed : doc.isRewardClaimed,
        
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}



export const mapPopulatedReviewDocToEntity = (doc: IReviewPopulatedUser): PopulatedReviewEntity => {
    return {
        reviewId    : doc._id.toString(),
        eventRef    : doc.eventRef.toString(),
        hostRef     : doc.hostRef.toString(),
        bookingRef  : doc.bookingRef.toString(),
        user    : {
            userId      : doc.userRef._id.toString(),
            name        : doc.userRef.name,
            profilePic  : doc.userRef.profilePic,
        },
        rating          : doc.rating,
        reviewText      : doc.reviewText,
        isRewardClaimed : doc.isRewardClaimed,

        createdAt   : doc.createdAt,
        updatedAt   : doc.updatedAt,
    };
};



// Maps raw data to the Database Input Entity
export const mapToCreateReviewInput = ({
    userId,
    eventId,
    hostId,
    reviewDto,
    isEligibleForReward
}: MapCreateReviewParams): CreateReviewInput => {
    return {
        eventRef        : new Types.ObjectId(eventId),
        hostRef         : new Types.ObjectId(hostId),
        userRef         : new Types.ObjectId(userId),
        bookingRef      : new Types.ObjectId(reviewDto.bookingId),
        rating          : reviewDto.rating,
        reviewText      : reviewDto.reviewText,
        isRewardClaimed : isEligibleForReward,
    };
};




// Populated Database Entity to the Frontend Response DTO
export const mapPopulatedReviewEntityToResponseDTO = (
    entity: PopulatedReviewEntity
): ReviewResponseDTO => {
    return {
        reviewId        : entity.reviewId,
        eventId         : entity.eventRef,
        hostId          : entity.hostRef,
        user            : entity.user,
        rating          : entity.rating,
        reviewText      : entity.reviewText,
        isRewardClaimed : entity.isRewardClaimed,
        createdAt       : entity.createdAt.toISOString(),
    };
};

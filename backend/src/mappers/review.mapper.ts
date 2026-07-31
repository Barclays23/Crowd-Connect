// backend/src/mappers/review.mapper.ts

import { ReviewResponseDTO, SubmitReviewRequestDTO } from "@/dtos/review.dto";
import { 
    AdminPopulatedReviewEntity, 
    CreateReviewInput, 
    PopulatedReviewEntity, 
    ReviewEntity 
} from "@/entities/review.entity";
import { 
    IReviewModel, 
    IReviewPopulatedAdmin, 
    IReviewPopulatedUser, 
    MapCreateReviewParams 
} from "@/types/review.types";
import { Types } from "mongoose";



// Maps raw data to the Database Input Entity
export const mapToCreateReviewInput = ({
    userId,
    eventId,
    hostId,
    reviewDto
}: MapCreateReviewParams): CreateReviewInput => {
    return {
        eventRef        : new Types.ObjectId(eventId),
        hostRef         : new Types.ObjectId(hostId),
        userRef         : new Types.ObjectId(userId),
        bookingRef      : new Types.ObjectId(reviewDto.bookingId),
        rating          : reviewDto.rating,
        reviewText      : reviewDto.reviewText,
    };
};




// Document -> Entity ----------------------------------------------------------------

export const mapReviewDocToEntity = (doc: IReviewModel): ReviewEntity => {
    return {
        reviewId    : doc._id.toString(),
        eventRef    : doc.eventRef.toString(),
        hostRef     : doc.hostRef.toString(),
        userRef     : doc.userRef.toString(),
        bookingRef  : doc.bookingRef.toString(),

        rating          : doc.rating,
        reviewText      : doc.reviewText,
        
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

        createdAt   : doc.createdAt,
        updatedAt   : doc.updatedAt,
    };
};



export const mapAdminPopulatedReviewDocToEntity = (doc: IReviewPopulatedAdmin): AdminPopulatedReviewEntity => {
    return {
        reviewId: doc._id.toString(),
        eventRef: doc.eventRef?._id?.toString() || doc.eventRef?.toString() || "unknown",
        eventTitle: doc.eventRef?.title,
        hostRef: doc.hostRef?._id?.toString() || doc.hostRef?.toString() || "unknown",
        hostName: doc.hostRef?.organizationName,
        user: {
            userId: doc.userRef._id.toString(),
            name: doc.userRef.name,
            email: doc.userRef.email,
            profilePic: doc.userRef.profilePic,
        },
        rating: doc.rating,
        reviewText: doc.reviewText,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
};





// Entity -> Response DTO -------------------------------------------------------------

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
        createdAt       : entity.createdAt.toISOString(),
    };
};




export const mapAdminPopulatedReviewEntityToDTO = (entity: AdminPopulatedReviewEntity): ReviewResponseDTO => {
    return {
        reviewId: entity.reviewId,
        eventId: entity.eventRef,
        eventTitle: entity.eventTitle,
        hostId: entity.hostRef,
        hostName: entity.hostName,
        user: {
            userId: entity.user.userId,
            name: entity.user.name,
            email: entity.user.email,
            profilePic: entity.user.profilePic,
        },
        rating: entity.rating,
        reviewText: entity.reviewText,
        createdAt: entity.createdAt.toISOString(),
    };
};
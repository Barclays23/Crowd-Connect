// backend/src/mappers/review.mapper.ts

import { ReviewResponseDTO } from "@/dtos/review.dto";
import { 
    AdminPopulatedReviewEntity, 
    CreateReviewInput, 
    PopulatedReviewEntity, 
    ReviewEntity 
} from "@/entities/review.entity";
import { 
    IReviewModel, 
    IReviewPopulatedAdmin, 
    IReviewPopulatedUserAndEvent, 
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



export const mapPopulatedReviewDocToEntity = (doc: IReviewPopulatedUserAndEvent): PopulatedReviewEntity => {
    return {
        reviewId    : doc._id.toString(),
        hostRef     : doc.hostRef.toString(),
        bookingRef  : doc.bookingRef.toString(),
        eventRef    : {
            eventId     : doc.eventRef._id.toString(),
            eventTitle  : doc.eventRef.title || "Unknown Event",
        },
        userRef    : {
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
        reviewId    : doc._id.toString(),
        hostRef     : doc.hostRef?._id?.toString() || doc.hostRef?.toString() || "unknown",
        hostName    : doc.hostRef?.organizationName,
        userRef     : {
            userId      : doc.userRef._id.toString(),
            name        : doc.userRef.name,
            email       : doc.userRef.email,
            profilePic  : doc.userRef.profilePic,
        },
        eventRef    : {
            eventId     : doc.eventRef._id.toString(),
            eventTitle  : doc.eventRef.title,
            // category    : doc.eventRef.category
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
        hostId          : entity.hostRef,
        user            : entity.userRef,
        event           : entity.eventRef,
        rating          : entity.rating,
        reviewText      : entity.reviewText,
        createdAt       : entity.createdAt.toISOString(),
    };
};




export const mapAdminPopulatedReviewEntityToDTO = (entity: AdminPopulatedReviewEntity): ReviewResponseDTO => {
    return {
        reviewId    : entity.reviewId,
        hostId      : entity.hostRef,
        hostName    : entity.hostName,
        user    : {
            userId      : entity.userRef.userId,
            name        : entity.userRef.name,
            email       : entity.userRef.email,
            profilePic  : entity.userRef.profilePic,
        },
        event  : {
            eventId     : entity.eventRef.eventId,
            eventTitle  : entity.eventRef.eventTitle,
        },
        rating      : entity.rating,
        reviewText  : entity.reviewText,
        createdAt   : entity.createdAt.toISOString(),
    };
};
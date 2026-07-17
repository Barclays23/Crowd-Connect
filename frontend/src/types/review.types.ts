// frontent/src/types/review.types.ts

import type { IPagination } from "@/types/common.types";



export interface IReviewState {
    reviewId    : string;
    eventId     : string;
    hostId      : string;
    user        : {
        userId      : string;
        name        : string;
        profilePic? : string;
    };
    rating          : number;
    reviewText?     : string;
    isRewardClaimed : boolean;

    createdAt       : string;
}



// REQUEST PAYLOAD TYPES ------------------------------------------------------------

export interface SubmitReviewPayload {
    bookingId: string;
    rating: number;
    reviewText?: string;
}


export interface EditReviewPayload {
    rating: number;
    reviewText?: string;
}




// RESPONSE DATA TYPES ------------------------------------------------------------

export interface GetReviewsResponse {
    reviews: IReviewState[];
    pagination: IPagination;
}
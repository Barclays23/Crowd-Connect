// frontent/src/types/review.types.ts


export interface IReviewState {
    reviewId    : string;
    eventId     : string;
    hostId      : string;
    hostName?   : string;
    user        : {
        userId      : string;
        name        : string;
        email?      : string;
        profilePic? : string;
    };
    event       : {
        eventId     : string;
        eventTitle  : string;
    }
    rating          : number;
    reviewText?     : string;

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


export interface AdminReviewQueryParams {
    page: number;
    limit: number;
    rating?: string;
    search?: string;
}




// RESPONSE DATA TYPES ------------------------------------------------------------

export interface GetReviewsResponse {
    reviews: IReviewState[];
}
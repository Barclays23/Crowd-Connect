// backend/src/dtos/review.dto.ts

import { IPagination } from "@/types/common.types";


// REQUESTS ------------------------------------------------------

export interface SubmitReviewRequestDTO {
  bookingId     : string;
  rating        : number;
  reviewText?   : string;
}


export interface EditReviewRequestDTO {
  rating        : number;
  reviewText?   : string;
}




// RESPONSE DATA TYPES ------------------------------------------------------

export interface ReviewResponseDTO {
  reviewId  : string;
  eventId   : string;
  hostId    : string;
  user      : {
    userId      : string;
    name        : string;
    profilePic? : string;
  };
  rating            : number;
  reviewText?       : string;
  isRewardClaimed   : boolean;
  createdAt         : string;
}



export interface GetReviewsResponseDTO {
  reviews   : ReviewResponseDTO[];
  pagination: IPagination;
}
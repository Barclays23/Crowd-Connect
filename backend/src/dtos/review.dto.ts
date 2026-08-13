// backend/src/dtos/review.dto.ts

import { IPagination } from "@/types/common.types";


// REQUESTS ------------------------------------------------------

export interface SubmitReviewRequestDTO {
  bookingId     : string;
  rating        : number;
  reviewText    : string;
}


export interface EditReviewRequestDTO {
  rating        : number;
  reviewText    : string;
}




// RESPONSE DATA TYPES ------------------------------------------------------

export interface ReviewResponseDTO {
  reviewId    : string;
  hostId      : string;
  hostName?   : string;
  user      : {
    userId      : string;
    name        : string;
    email?      : string;
    profilePic? : string;
  };
  event     : {
    eventId     : string;
    eventTitle  : string;
  }
  rating            : number;
  reviewText?       : string;
  createdAt         : string;
}



export interface GetReviewsResponseDTO {
  reviews   : ReviewResponseDTO[];
  pagination: IPagination;
}
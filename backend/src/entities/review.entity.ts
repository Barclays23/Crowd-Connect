// backend/src/entities/user.entity.ts
import { Types } from "mongoose";


export interface ReviewEntity {
  reviewId  : string;
  eventRef  : string;
  hostRef   : string;
  userRef   : string;
  bookingRef: string;

  rating            : number;
  reviewText?       : string;

  createdAt: Date;
  updatedAt: Date;
}



// Used when sending reviews to the frontend (includes user details)
export interface PopulatedReviewEntity extends Omit<ReviewEntity, "userRef" | "eventRef"> {
  userRef : {
    userId        : string;
    name          : string;
    profilePic?   : string;
  };
  eventRef : {
    eventId       : string;
    eventTitle    : string; 
  }
}



export interface AdminPopulatedReviewEntity {
  reviewId  : string;
  hostRef   : string;
  hostName? : string;
  userRef   : {
    userId      : string;
    name        : string;
    email?      : string;
    profilePic? : string;
  };
  eventRef : {
    eventId     : string;
    eventTitle  : string;
    // category    : string;
  }
  rating: number;
  reviewText?: string;
  createdAt: Date;
  updatedAt: Date;
}



export interface CreateReviewInput {
  eventRef      : Types.ObjectId;
  hostRef       : Types.ObjectId;
  userRef       : Types.ObjectId;
  bookingRef    : Types.ObjectId;

  rating            : number;
  reviewText?       : string;
}
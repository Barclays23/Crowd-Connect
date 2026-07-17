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
  isRewardClaimed   : boolean;

  createdAt: Date;
  updatedAt: Date;
}



// Used when sending reviews to the frontend (includes user details)
export interface PopulatedReviewEntity extends Omit<ReviewEntity, "userRef"> {
  user: {
    userId      : string;
    name        : string;
    profilePic? : string;
  };
}



export interface CreateReviewInput {
  eventRef      : Types.ObjectId;
  hostRef       : Types.ObjectId;
  userRef       : Types.ObjectId;
  bookingRef    : Types.ObjectId;

  rating            : number;
  reviewText?       : string;
  isRewardClaimed   : boolean;
}
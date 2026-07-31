// backend/src/types/review.types.ts

import { SubmitReviewRequestDTO } from "@/dtos/review.dto";
import { Types } from "mongoose";


export interface IReviewModel {
  _id           : Types.ObjectId;
  eventRef      : Types.ObjectId;
  hostRef       : Types.ObjectId;
  userRef       : Types.ObjectId;
  bookingRef    : Types.ObjectId;

  rating            : number;
  reviewText?       : string;

  createdAt : Date;
  updatedAt : Date;
}




export interface IReviewPopulatedUser extends Omit<IReviewModel, 'userRef'> {
  userRef: {
    _id: Types.ObjectId;
    name: string;
    profilePic?: string;
  };
}



export interface IReviewPopulatedAdmin extends Omit<IReviewModel, 'userRef' | 'eventRef' | 'hostRef'> {
  userRef: {
    _id: Types.ObjectId;
    name: string;
    email?: string;
    profilePic?: string;
  };
  eventRef?: {
    _id: Types.ObjectId;
    title: string;
    category: string;
  };
  hostRef?: {
    _id: Types.ObjectId;
    organizationName: string;
  };
}


export interface GetReviewsFilter {
  page: number;
  limit: number;
  hostId?: string;
  eventId?: string;
}


export interface GetReviewsAdminFilter {
  page: number;
  limit: number;
  rating?: number;
  search?: string;
}




export interface MapCreateReviewParams {
    userId: string;
    eventId: string;
    hostId: string;
    reviewDto: SubmitReviewRequestDTO;
}
// backend/src/models/implementations/review.model.ts
import { IReviewModel } from "@/types/review.types";
import { model, Model, Schema } from "mongoose";



const reviewSchema = new Schema<IReviewModel>(
  {
    eventRef    : { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    hostRef     : { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userRef     : { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingRef  : { type: Schema.Types.ObjectId, ref: "Booking", required: true },

    rating          : { type: Number, required: true, min: 1, max: 5 },
    reviewText      : { type: String, trim: true },
    isRewardClaimed : { type: Boolean, default: false }
  },
  { timestamps: true }
);



// STRICT RULE: One review per user per event
reviewSchema.index({ eventRef: 1, userRef: 1 }, { unique: true });
reviewSchema.index({ hostRef: 1 });



const Review: Model<IReviewModel> = model<IReviewModel>("Review", reviewSchema);
export default Review;
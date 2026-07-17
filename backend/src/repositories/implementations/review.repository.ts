// backend/src/repositories/implementations/review.repository.ts
import Review from "@/models/implementations/review.model";
import { Types } from "mongoose";
import { BaseRepository } from "@/repositories/base.repository";
import { GetReviewsFilter, IReviewModel, IReviewPopulatedUser } from "@/types/review.types";
import { CreateReviewInput, PopulatedReviewEntity, ReviewEntity } from "@/entities/review.entity";
import { IReviewRepository } from "@/repositories/interfaces/IReviewRepository";
import { mapPopulatedReviewDocToEntity, mapReviewDocToEntity } from "@/mappers/review.mapper";




export class ReviewRepository extends BaseRepository<IReviewModel> implements IReviewRepository {

    constructor() {
        super(Review);
    }

    async createReview(input: CreateReviewInput): Promise<ReviewEntity> {
        const doc: IReviewModel = await this.createOne(input);
        return mapReviewDocToEntity(doc);
    }


    async updateReview(reviewId: string, rating: number, reviewText?: string): Promise<ReviewEntity | null> {
        const doc: IReviewModel | null = await this.findByIdAndUpdate(reviewId, { $set: { rating, reviewText } });
        return doc ? mapReviewDocToEntity(doc) : null;
    }


    async deleteReview(reviewId: string): Promise<void> {
        await this.findByIdAndDelete(reviewId);
    }


    async findReviews(filters: GetReviewsFilter): Promise<{ reviews: PopulatedReviewEntity[]; totalCount: number }> {
        const { page, limit, hostId, eventId } = filters;
        const query: Record<string, unknown> = {};

        if (hostId) query.hostRef = new Types.ObjectId(hostId);
        if (eventId) query.eventRef = new Types.ObjectId(eventId);

        const skip = (page - 1) * limit;

        const [docs, totalCount] = await Promise.all([
            this.findManyQuery(query)
                .populate("userRef", "name profilePic")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean<IReviewPopulatedUser[]>(),
            this.countDocuments(query),
        ]);

        const reviews: PopulatedReviewEntity[] = docs.map(mapPopulatedReviewDocToEntity);

        return { reviews, totalCount };
    }

    

    async getReviewById(reviewId: string): Promise<ReviewEntity | null> {
        const doc: IReviewModel | null = await this.findByIdQuery(reviewId).lean();
        return doc ? mapReviewDocToEntity(doc as IReviewModel) : null;
    }


    async getReviewByBookingId(bookingId: string): Promise<ReviewEntity | null> {
        const doc: IReviewModel | null = await this.findOneQuery({ bookingRef: new Types.ObjectId(bookingId) }).lean();
        return doc ? mapReviewDocToEntity(doc as IReviewModel) : null;
    }


    async getReviewByUserAndEvent(userId: string, eventId: string): Promise<ReviewEntity | null> {
        const doc: IReviewModel | null = await this.findOneQuery({ 
            userRef: new Types.ObjectId(userId),
            eventRef: new Types.ObjectId(eventId)
        }).lean();
        
        return doc ? mapReviewDocToEntity(doc as IReviewModel) : null;
    }



    async getAverageRatingForEvent(eventId: string): Promise<{ average: number, total: number }> {
        const stats = await this.model.aggregate([
            { $match: { eventRef: new Types.ObjectId(eventId) } },
            { $group: { _id: null, ratingAverage: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
        ]);

        if (stats.length > 0) {
            return {
                average: Math.round(stats[0].ratingAverage * 10) / 10,
                total: stats[0].totalReviews
            };
        }
        return { average: 0, total: 0 };
    }



    async getAverageRatingForHost(hostId: string): Promise<{ average: number, total: number }> {
        const stats = await this.model.aggregate([
            { $match: { hostRef: new Types.ObjectId(hostId) } },
            { $group: { _id: null, ratingAverage: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
        ]);

        if (stats.length > 0) {
            return {
                average: Math.round(stats[0].ratingAverage * 10) / 10,
                total: stats[0].totalReviews
            };
        }
        return { average: 0, total: 0 };
    }


}
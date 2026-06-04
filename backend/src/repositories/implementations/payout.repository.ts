// backend/src/repositories/implementations/payout.repository.ts
import { ClientSession, Types } from "mongoose";

import { 
    IPayoutRequestModel, 
    CreatePayoutInput, 
    GetPayoutsFilter, 
    UpdatePayoutInput, 
    PayoutFilterQuery,
    PAYOUT_REQUEST_STATUS
} from "@/types/payout.types";
import { BaseRepository } from "@/repositories/base.repository";
import { IPayoutRepository } from "@/repositories/interfaces/IPayoutRequestRepository";
import { PayoutRequestModel } from "@/models/implementations/payoutRequest.model";
import { PayoutEntity } from "@/entities/payout.entity";
import { mapModelToPayoutEntity } from "@/mappers/payout.mapper";




export class PayoutRepository extends BaseRepository<IPayoutRequestModel> implements IPayoutRepository {
    constructor() {
        super(PayoutRequestModel);
    }

    async createPayout(payoutInput: CreatePayoutInput, options?: { session: ClientSession }): Promise<PayoutEntity> {
        const payload: Partial<IPayoutRequestModel> = {
            ...payoutInput,
            eventRef: new Types.ObjectId(payoutInput.eventRef),
            hostRef: new Types.ObjectId(payoutInput.hostRef)
        };

        const payoutDoc: IPayoutRequestModel = await this.createOne(payload, options);

        const payoutEntity: PayoutEntity = mapModelToPayoutEntity(payoutDoc);

        return payoutEntity;
    }


    async findPayoutById(payoutId: string): Promise<PayoutEntity | null> {
        const doc: IPayoutRequestModel | null = await this.findById(payoutId);
        return doc ? mapModelToPayoutEntity(doc) : null;
    }
    


    async findPayoutByEventId(eventId: string): Promise<PayoutEntity | null> {
        const payout: IPayoutRequestModel | null = await this.findOneQuery({ eventRef: eventId })
        .lean<IPayoutRequestModel>()
        .exec();

        return payout ? mapModelToPayoutEntity(payout) : null;
    }



    async findPayoutByEventIds(eventIds: string[]): Promise<PayoutEntity[]> {
        const docs: IPayoutRequestModel[] = await this.findMany({ eventRef: { $in: eventIds } });

        return docs.map(mapModelToPayoutEntity);
    }



    async findPayouts(filters: GetPayoutsFilter): Promise<PayoutEntity[]> {
        const query: PayoutFilterQuery = {};
        
        if (filters.status && filters.status !== "all") {
            query.status = filters.status as PAYOUT_REQUEST_STATUS;
        }
        if (filters.hostId) {
            query.hostRef = new Types.ObjectId(filters.hostId);
        }

        const docs = await this.findManyQuery(query)
            .sort({ [filters.sortBy || "requestedAt"]: filters.sortOrder === "asc" ? 1 : -1 })
            .skip((filters.page - 1) * filters.limit)
            .limit(filters.limit)
            .populate("eventRef", "title ticketPrice soldTickets")
            .populate("hostRef", "name organizationName")
            .lean()
            .exec() as IPayoutRequestModel[];

        return docs.map(mapModelToPayoutEntity);
    }



    async countPayouts(filters: GetPayoutsFilter): Promise<number> {
        const query: PayoutFilterQuery = {};
        
        if (filters.status && filters.status !== "all") {
            query.status = filters.status as PAYOUT_REQUEST_STATUS;
        }
        if (filters.hostId) {
            query.hostRef = new Types.ObjectId(filters.hostId);
        }
        
        return this.countDocuments(query);
    }



    async updatePayout(
        payoutId: string, 
        updateData: UpdatePayoutInput,
        options?: { session: ClientSession }
    ): Promise<PayoutEntity | null> {
        const doc: IPayoutRequestModel | null = await this.findByIdAndUpdate(payoutId, updateData, options);
        return doc ? mapModelToPayoutEntity(doc) : null;
    }


}
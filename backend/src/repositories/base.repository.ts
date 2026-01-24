// backend/src/repositories/base.repository.ts
import mongoose, { 
    Document, 
    Model,
    QueryFilter,
    UpdateQuery,
    // FilterQuery
} from "mongoose";








export abstract class BaseRepository<T extends Document> {

    constructor(protected model: Model<T>) {}

    async createOne(data: Partial<T>): Promise<T>{
        const document = new this.model(data);
        const savedDocument = await document.save();
        return savedDocument;
    }


    async findOne(query: QueryFilter<T>): Promise<T | null>{
        const findDocument = await this.model.findOne(query);
        return findDocument;
    }


    async findById(id: string): Promise<T | null>{
        const findDocument = await this.model.findById(id);
        return findDocument;
    }

    async findByIdAndUpdate(updateId: string, updateData: UpdateQuery<T>): Promise<T | null>{
        const updatedDocument = await this.model.findByIdAndUpdate(
            updateId,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        return updatedDocument;
    }


    async findByIdAndDelete(id: string): Promise<T | null>{
        const deletedDocument = await this.model.findByIdAndDelete(id);
        return deletedDocument;
    }


    async findOneAndUpdate(query: QueryFilter<T>, updateData: Partial<T>): Promise<T | null>{
        const updatedDocument = await this.model.findOneAndUpdate(
            query,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        return updatedDocument;
    }


    async findMany(): Promise<T[]>{
        const findDocuments = await this.model.find();
        return findDocuments;
    }
 

    async countDocuments(query: QueryFilter<T>): Promise<number> {
        const count = await this.model.countDocuments(query);
        return count;
    }

    


}
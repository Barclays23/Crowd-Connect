// backend/src/repositories/base.repository.ts
import mongoose, { 
    Document, 
    Model,
    QueryFilter,
    UpdateQuery,
} from "mongoose";







// export abstract class BaseRepository<T extends Document> {
export abstract class BaseRepository<T> {

    constructor(protected model: Model<T>) {}
    

    async createOne(data: Partial<T>): Promise<T>{
        const document = new this.model(data);
        const savedDocument = await document.save();
        return savedDocument as unknown as T;
    }


    async findOne(query: QueryFilter<T>): Promise<T | null>{
        const findDocument = await this.model.findOne(query);
        return findDocument as unknown as T;
    }


    async findById(id: string): Promise<T | null>{
        const findDocument = await this.model.findById(id);
        return findDocument as unknown as T;
    }
    
    // Query builders for complex operations (populations)
    findByIdQuery(id: string) { // findByIdQuery
        return this.model.findById(id);  // Returns a Query object, not a Promise
    }

    async findByIdAndUpdate(updateId: string, updateData: UpdateQuery<T>): Promise<T | null>{
        const updatedDocument = await this.model.findByIdAndUpdate(
            updateId,
            { $set: updateData },
            // { new: true, runValidators: true }  // depricated
            { returnDocument: 'after', runValidators: true }
        );
        return updatedDocument as unknown as T;
    }


    async findByIdAndDelete(id: string): Promise<T | null>{
        const deletedDocument = await this.model.findByIdAndDelete(id);
        return deletedDocument as unknown as T;
    }


    async findOneAndUpdate(query: QueryFilter<T>, updateData: Partial<T>): Promise<T | null>{
        const updatedDocument = await this.model.findOneAndUpdate(
            query,
            { $set: updateData },
            // { new: true, runValidators: true }  // depricated
            { returnDocument: 'after', runValidators: true }
        );
        return updatedDocument as unknown as T;
    }


    async findMany(query: QueryFilter<T> = {}, options?: {
        skip?: number;
        limit?: number;
        sort?: Record<string, 1 | -1>;
    }): Promise<T[]> {
        return await this.model
            .find(query)
            .skip(options?.skip ?? 0)
            .limit(options?.limit ?? 0)
            .sort(options?.sort ?? {}) as unknown as T[];
    }
    

    async updateMany(query: QueryFilter<T>, updateData: UpdateQuery<T>): Promise<void> {
        await this.model.updateMany(query, updateData);
    }
 

    async countDocuments(query: QueryFilter<T>): Promise<number> {
        const count = await this.model.countDocuments(query);
        return count;
    }

}
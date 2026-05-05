// backend/src/repositories/base.repository.ts
import { 
    ClientSession,
    Model,
    QueryFilter,
    UpdateQuery,
} from "mongoose";







export abstract class BaseRepository<T> {

    constructor(protected readonly model: Model<T>) {}
    

    async createOne(
        data: Partial<T>,
        options: { session?: ClientSession } = {}
    ): Promise<T>{
        const { session } = options;

        const document = new this.model(data);
        const savedDocument = await document.save({session});
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
    

    // Returns Query object for chaining (.populate, .select, etc.)
    findByIdQuery(id: string) {
        return this.model.findById(id);  // Returns a Query object, not a Promise
    }

    
    findOneQuery(query: QueryFilter<T>) {
        return this.model.findOne(query);  // Returns Query object for chaining
    }


    // Returns Query object for chaining (.sort, .skip, .limit, .lean, .select etc.)
    findManyQuery(query: QueryFilter<T> = {}) {
        return this.model.find(query);  // Returns a Query object, not a Promise
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



    // Caller controls the full update operator ($set, $inc, $push, etc.)
    async findOneAndUpdate(
        query: QueryFilter<T>, 
        updateData: UpdateQuery<T>,
        options: { session?: ClientSession; new?: boolean } = {}
    ): Promise<T | null>{
        const updatedDocument = await this.model.findOneAndUpdate(
            query,
            updateData,
            // { new: true, runValidators: true }  // depricated
            { 
                returnDocument  : 'after', 
                runValidators   : true, 
                session         : options.session
            }
        );
        return updatedDocument as unknown as T;
    }



    // Caller controls the full update operator ($set, $inc, $push, etc.)
    async findByIdAndUpdate(
        updateId: string, 
        updateData: UpdateQuery<T>,
        options: { session?: ClientSession; new?: boolean } = {}
    ): Promise<T | null> {
        const updatedDocument = await this.model.findByIdAndUpdate(
            updateId,
            updateData,
            // { new: true, runValidators: true }  // depricated
            { 
                returnDocument  : 'after', 
                runValidators   : true, 
                session         : options.session
            }
        );
        return updatedDocument as unknown as T;
    }


    async findByIdAndDelete(id: string): Promise<T | null>{
        const deletedDocument = await this.model.findByIdAndDelete(id);
        return deletedDocument as unknown as T;
    }

    

    async updateMany(query: QueryFilter<T>, updateData: UpdateQuery<T>): Promise<void> {
        await this.model.updateMany(query, updateData);
    }
 

    async countDocuments(query: QueryFilter<T>): Promise<number> {
        const count = await this.model.countDocuments(query);
        return count;
    }


    async startSession(): Promise<ClientSession> {
        return this.model.db.startSession();
    }

}
import { 
    Document, 
    Model,
    // FilterQuery
} from "mongoose";


type MongooseFilterQuery<T> = {
    // Allows querying based on document properties (T[P]) or MongoDB operators
    [P in keyof T]?: T[P] | { $in: T[P][] } | any; 
} & {
    // Standard MongoDB operators
    $and?: MongooseFilterQuery<T>[];
    $or?: MongooseFilterQuery<T>[];
} & Record<string, any>; // Allows for other operators like $regex, $gt, etc.





export abstract class BaseRepository<T extends Document> {

    constructor(protected model: Model<T>) {}

    async createOne(data: Partial<T>): Promise<T>{
        const document = new this.model(data);
        const savedDocument = await document.save();
        return savedDocument;
    }


    async findOne(query: MongooseFilterQuery<T>): Promise<T | null>{
        const findDocument = await this.model.findOne(query);
        return findDocument;
    }


    async findById(id: string): Promise<T | null>{
        const findDocument = await this.model.findById(id);
        return findDocument;
    }

    async findByIdAndUpdate(updateId: string, updateData: Partial<T>): Promise<T | null>{
        const updatedDocument = await this.model.findByIdAndUpdate(
            updateId,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        return updatedDocument;
    }

//                 await User.updateOne(
//   { _id: userId },
//   { $set: updateEntity }
// );


    async findMany(): Promise<T[]>{
        const findDocuments = await this.model.find();
        return findDocuments;
    }
 

    async countDocuments(query: MongooseFilterQuery<T>): Promise<number> {
        const count = await this.model.countDocuments(query);
        return count;
    }

    


}
import { 
    Document, 
    FilterQuery, 
    Model 
} from "mongoose";


export abstract class BaseRepository<T extends Document> {

    constructor(protected model: Model<T>) {}

    async createOne(data: Partial<T>): Promise<T>{
        const document = new this.model(data)
        const savedDocument = document.save()
        return savedDocument;
    }


    async findOne(query: FilterQuery<T>): Promise<T | null>{
        const findDocument = this.model.findOne(query);
        return findDocument;
    }


}
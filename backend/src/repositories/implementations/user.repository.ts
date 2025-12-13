// backend/src/repositories/implementations/user.repository.ts
import { IUserLean } from "@shared/types";
import User, { IUserModel } from "../../models/implementations/user.model";
import { BaseRepository } from "../base.repository";
import { IUserRepository } from "../interfaces/IUserRepository";




export class UserRepository extends BaseRepository<IUserModel> implements IUserRepository {
    constructor() {
        super(User)
        this.model = User;
    }


    async createUser(user: IUserModel): Promise<IUserModel> {
        try {
            const userData = await this.createOne(user);
            return userData;
        } catch (error) {
            console.log('error in createUser :', error);
            throw error;
        }
    }


    async findUserByEmail(email: string): Promise<IUserModel | null> {
        try {
            const userData = await this.findOne({email})
            return userData;
        } catch (error) {
            console.log('error in findUserByEmail :', error);
            throw new Error("Error Finding User");
        }
    }


    async findUserById(userId: string): Promise<IUserModel | null> {
        try {
            const userData = await this.findOne({_id: userId})
            return userData;

        } catch (error) {
            console.log('error in findUserById :', error);
            throw new Error("Error Finding User");
        }
    }


    async findUsers(query: any, skip: number, limit: number): Promise<IUserModel[]> {
        try {
            const paginatedUsers = await this.model.find(query)
            .select('-password') // ← exclude password field
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(); // faster + easier to map

            // console.log('✅  paginatedUsers :', paginatedUsers);

            return paginatedUsers;

        } catch (error) {
            console.log('error in findUsers :', error);
            throw new Error("Error Finding Users");
        }
    }



    async countUsers(query: any): Promise<number> {
        try {
            const count = await this.countDocuments(query);
            return count;
        } catch (error) {
            console.log('error in countUsers :', error);
            throw new Error("Error Counting Users");
        }
    }


    
}
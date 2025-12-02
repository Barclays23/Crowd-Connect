// backend/src/repositories/implementations/user.repository.ts
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
}
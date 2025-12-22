// backend/src/repositories/implementations/user.repository.ts
import User, { IUser, IUserModel } from "../../models/implementations/user.model";
import { BaseRepository } from "../base.repository";
import { IUserRepository } from "../interfaces/IUserRepository";
import { AuthUserCheckEntity, CreateUserEntity, SensitiveUserEntity, SignUpUserEntity, UserEntity } from "../../entities/user.entity";
import { mapUserModelToUserEntity, mapUserModelToSensitiveUserEntity } from "../../mappers/user.mapper";




export class UserRepository extends BaseRepository<IUserModel> implements IUserRepository {
    constructor() {
        super(User)
        this.model = User;
    }


    // user registration (after verifying otp)
    async createUser(user: SignUpUserEntity): Promise<UserEntity> {  // not (user: IUserModel)
        try {
            const userData: IUserModel = await this.createOne(user);
            const userEntity: UserEntity = mapUserModelToUserEntity(userData);
            return userEntity;

        } catch (error) {
            console.log('error in createUser :', error);
            throw error;
        }
    }


    
    async createUserByAdmin(user: CreateUserEntity): Promise<UserEntity> {
        try {
            const userData: IUserModel = await this.createOne(user);
            const userEntity: UserEntity = mapUserModelToUserEntity(userData);
            return userEntity;

        } catch (error) {
            console.log('error in createUserByAdmin :', error);
            throw error;
        }
    }


    async findUserByEmail(email: string): Promise<UserEntity | null> {
        try {
            const userData: IUserModel | null = await this.findOne({email});
            const result: UserEntity | null = userData ? mapUserModelToSensitiveUserEntity(userData) : null;
            return result;
            
        } catch (error) {
            console.log('error in findUserByEmail :', error);
            throw new Error("Error Finding User");
        }
    }


    async findUserById(userId: string): Promise<UserEntity | null> {
        try {
            const userData: IUserModel | null = await this.findById(userId);
            const result: UserEntity | null = userData ? mapUserModelToUserEntity(userData) : null;
            return result;

        } catch (error) {
            console.log('error in findUserById :', error);
            throw new Error("Error Finding User");
        }
    }



    async findAuthUser(email: AuthUserCheckEntity): Promise<SensitiveUserEntity | null> {
        try {
            const userData: IUserModel | null = await this.findOne(email);
            const result: SensitiveUserEntity | null = userData ? mapUserModelToSensitiveUserEntity(userData) : null;
            return result;

        } catch (error) {
            console.log('error in findUserById :', error);
            throw new Error("Error Finding User");
        }
    }


    async findUsers(query: any, skip: number, limit: number): Promise<UserEntity[] | null> {
        try {
            const paginatedUsers: IUserModel[] = await this.model.find(query)
            .select('-password') // ← exclude password field
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(); // faster + easier to map

            // console.log('✅  paginatedUsers :', paginatedUsers);

            const result: UserEntity[] | null = paginatedUsers ? paginatedUsers.map(user => mapUserModelToUserEntity(user)) : null;
            return result;

        } catch (error) {
            console.log('error in findUsers :', error);
            throw new Error("Error Finding Users");
        }
    }



    async countUsers(query: any): Promise<number> {
        try {
            const count: number = await this.countDocuments(query);
            return count;
        } catch (error) {
            console.log('error in countUsers :', error);
            throw new Error("Error Counting Users");
        }
    }


    
}
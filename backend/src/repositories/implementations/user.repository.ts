// backend/src/repositories/implementations/user.repository.ts
import User, { IUser, IUserModel } from "../../models/implementations/user.model";
import { BaseRepository } from "../base.repository";
import { IUserRepository } from "../interfaces/IUserRepository";
import { 
    AuthUserCheckEntity, 
    CreateUserEntity, 
    HostEntity, 
    UserEntity,
    SensitiveUserEntity, 
    SignUpUserEntity, 
    UpdateUserEntity,
    UpgradeHostEntity, 
} from "../../entities/user.entity";

import { 
    mapUserModelToUserEntity, 
    mapUserModelToSensitiveUserEntity, 
    mapUserModelToHostEntity
} from "../../mappers/user.mapper";




export class UserRepository extends BaseRepository<IUserModel> implements IUserRepository {
    constructor() {
        super(User)
        this.model = User;
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


    async findUserByMobile(mobile: string): Promise<UserEntity | null> {
        try {
            const userData: IUserModel | null = await this.findOne({mobile});
            const result: UserEntity | null = userData ? mapUserModelToSensitiveUserEntity(userData) : null;
            return result;
            
        } catch (error) {
            console.log('error in findUserByMobile :', error);
            throw new Error("Error Finding User");
        }
    }


    async findUserById(userId: string): Promise<UserEntity | HostEntity | null> {
        try {
            const userData: IUserModel | null = await this.findById(userId);
            console.log('✅✅✅✅✅ REPO ✅✅✅✅✅✅✅ User data in userRepository.findUserById:', userData);
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
            .select('-password')
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

    
    async createUserByAdmin(userEntity: CreateUserEntity): Promise<UserEntity> {
        try {
            const userData: IUserModel = await this.createOne(userEntity);
            const resultEntity: UserEntity = mapUserModelToUserEntity(userData);
            return resultEntity;

        } catch (error) {
            console.log('error in createUserByAdmin :', error);
            throw error;
        }
    }


    async updateUserByAdmin(userId: string, userEntity: UpdateUserEntity): Promise<UserEntity> {
        try {
            // console.log('✅ userId received in userRepository.updateUserByAdmin:', userId);
            // console.log('✅ userEntity received in userRepository.updateUserByAdmin:', userEntity);

            const updatedUserData: IUserModel | null = await this.findByIdAndUpdate(userId, userEntity);
            if (!updatedUserData) {
                throw new Error("User not found");
            }
            const resultEntity: UserEntity = mapUserModelToUserEntity(updatedUserData);
            // console.log('✅ resultEntity in userRepository.updateUserByAdmin:', resultEntity);
            return resultEntity;

        } catch (error) {
            console.log('error in updateUserByAdmin :', error);
            throw error;
        }
    }


    async updateUserProfile(userId: string, userEntity: Partial<UserEntity>): Promise<UserEntity> {
        try {
            const updatedUserData: IUserModel | null = await this.findByIdAndUpdate(userId, userEntity);
            if (!updatedUserData) {
                throw new Error("User not found");
            }
            const resultEntity: UserEntity = mapUserModelToUserEntity(updatedUserData);
            return resultEntity;

        } catch (error) {
            console.log('error in updateUserProfile :', error);
            throw error;
        }
    }


    async updateUserPassword(email: string, hashedPassword: string): Promise<UserEntity | null> {
        try {
            const updatedUserData: IUserModel | null = await this.findOneAndUpdate({ email }, { password: hashedPassword });
            const resultEntity: UserEntity | null = updatedUserData ? mapUserModelToUserEntity(updatedUserData) : null;
            return resultEntity;

        } catch (error) {
            console.log('error in updateUserPassword :', error);
            throw new Error("Error Updating User Password");
        }
    }


    async updateHostDetails(userId: string, hostEntity: UpgradeHostEntity): Promise<HostEntity> {
        try {
            const updatedHostData: IUserModel | null = await this.findByIdAndUpdate(userId, hostEntity);
            if (!updatedHostData) {
                throw new Error("User not found");
            }
            const resultEntity: HostEntity = mapUserModelToHostEntity(updatedHostData);
            return resultEntity;

        } catch (error) {
            console.log('error in updateHostDetails :', error);
            throw error;
        }
    }

    
}
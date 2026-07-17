// backend/src/repositories/implementations/user.repository.ts
import User from "@/models/implementations/user.model";
import { BaseRepository } from "../base.repository";
import { IUserRepository } from "../interfaces/IUserRepository";
import { 
    SignUpUserInput, 
    CreateUserInput, 
    UpdateUserInput,
    UpgradeHostInput, 
    AuthUserCheckInput, 
    HostEntity, 
    UserEntity,
    SensitiveUserEntity,
    HostUpdateInput,
    UserProfileEntity,
    HostManageInput,
    UpdateProfilePicInput,
    CreateGoogleAuthUserInput, 
} from "@/entities/user.entity";

import { 
    mapUserModelToUserEntity, 
    mapUserModelToSensitiveUserEntity, 
    mapUserModelToHostEntity,
    mapUserModelToProfileEntity
} from "@/mappers/user.mapper";
import { UserStatus } from "@/constants/user-system.constants";
import { UpdateEmailDto } from "@/dtos/auth.dto";


import { IUserModel, UserFilterQuery } from '@/types/user.types';
import { ClientSession } from "mongoose";




export class UserRepository extends BaseRepository<IUserModel> implements IUserRepository {
    constructor() {
        super(User)
    }



    async getUserByEmail(email: string): Promise<SensitiveUserEntity | null> {
        const userData: IUserModel | null = await this.findOne({email});
        const result: SensitiveUserEntity | null = userData ? mapUserModelToSensitiveUserEntity(userData) : null;
        return result;
    }




    async getUserByMobile(mobile: string): Promise<SensitiveUserEntity | null> {
        const userData: IUserModel | null = await this.findOne({mobile});
        const result: SensitiveUserEntity | null = userData ? mapUserModelToSensitiveUserEntity(userData) : null;
        return result;
    }


    async getUserById(userId: string): Promise<UserEntity | null> {
        const userData: IUserModel | null = await this.findById(userId);
        const result: UserEntity | null = userData ? mapUserModelToUserEntity(userData) : null;
        return result;
    }


    async getHostById(hostId: string): Promise<HostEntity | null> {
        const userData: IUserModel | null = await this.findById(hostId);
        const result: HostEntity | null = userData ? mapUserModelToHostEntity(userData) : null;
        return result;
    }


    // to get full profile
    async getUserProfile(userId: string): Promise<UserProfileEntity | null> {
        const userData: IUserModel | null = await this.findById(userId);
        const result: UserProfileEntity | null = userData ? mapUserModelToProfileEntity(userData) : null;
        return result;
    }


    async findAuthUser(email: AuthUserCheckInput): Promise<SensitiveUserEntity | null> {
        const userData: IUserModel | null = await this.findOne(email);
        const result: SensitiveUserEntity | null = userData ? mapUserModelToSensitiveUserEntity(userData) : null;
        return result;
    }


    async findUsers(query: UserFilterQuery, skip: number, limit: number): Promise<UserEntity[]> {
        const users: IUserModel[] = await this.findManyQuery(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const result: UserEntity[] = users.map(user => mapUserModelToUserEntity(user));
        return result;
    }

    
    async findHosts(query: UserFilterQuery, skip: number, limit: number): Promise<HostEntity[]> {
        const hosts: IUserModel[] = await this.findManyQuery(query)
            .select('-password')
            .sort({ hostAppliedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const result: HostEntity[] = hosts.map(mapUserModelToHostEntity);
        return result;
    }


    async countUsers(query: UserFilterQuery): Promise<number> {
        const count: number = await this.countDocuments(query);
        return count;
    }


    // user registration (after verifying otp)
    async createUser(userInput: SignUpUserInput): Promise<UserEntity> {
        const userData: IUserModel = await this.createOne(userInput);
        const userEntity: UserEntity = mapUserModelToUserEntity(userData);
        return userEntity;
    }


    async createGoogleAuthUser(userInput: CreateGoogleAuthUserInput): Promise<UserEntity> {
        const userData: IUserModel = await this.createOne(userInput);
        return mapUserModelToUserEntity(userData);
    }

    
    async createUserByAdmin(userInput: CreateUserInput): Promise<UserEntity> {
        const userData: IUserModel = await this.createOne(userInput);
        const resultEntity: UserEntity = mapUserModelToUserEntity(userData);
        return resultEntity;
    }


    async updateUserByAdmin(userId: string, updateInput: UpdateUserInput): Promise<UserEntity | null> {
        const updatedUserData: IUserModel | null = await this.findByIdAndUpdate(userId, { $set: updateInput });

        const resultEntity: UserEntity | null = updatedUserData ? mapUserModelToUserEntity(updatedUserData) : null;
        return resultEntity;
    }


    async updateUserProfile(userId: string, updateInput: UpdateUserInput): Promise<UserEntity|null> {
        const updatedUserData: IUserModel | null = await this.findByIdAndUpdate(userId, { $set: updateInput });

        const resultEntity: UserEntity | null = updatedUserData ? mapUserModelToUserEntity(updatedUserData): null;
        return resultEntity;
    }

    
    async updateProfilePicture(userId: string, profilPicInput: UpdateProfilePicInput): Promise<UserEntity | null>{
        const updatedUserData: IUserModel | null = await this.findByIdAndUpdate(userId, { $set: profilPicInput });

        const resultEntity: UserEntity | null = updatedUserData ? mapUserModelToUserEntity(updatedUserData) : null;
        return resultEntity;
    }



    async updateUserStatus(userId: string, newStatus: UserStatus): Promise<UserStatus | null> {
        const updatedUserData: IUserModel | null = await this.findByIdAndUpdate(userId, { $set: { status: newStatus } });

        const updatedStatus: UserStatus | null = updatedUserData ? updatedUserData.status : null;
        return updatedStatus;
    }


    async updateHostStatus(hostId: string, hostStatusInput: HostManageInput): Promise<HostEntity | null> {
        const updatedHostData: IUserModel | null = await this.findByIdAndUpdate(hostId, { $set: hostStatusInput });
        const resultEntity: HostEntity | null = updatedHostData ? mapUserModelToHostEntity(updatedHostData) : null;
        return resultEntity;
    }


    async updateUserEmail(userId: string, updateInput: UpdateEmailDto): Promise<UserEntity | null> {
        const updatedUserData: IUserModel | null = await this.findByIdAndUpdate(userId, {$set: updateInput});
        const resultEntity: UserEntity | null = updatedUserData ? mapUserModelToUserEntity(updatedUserData) : null;
        return resultEntity;
    }


    async updateUserPassword(email: string, hashedPassword: string): Promise<UserEntity | null> {
        const updatedUserData: IUserModel | null  = await this.findOneAndUpdate(
            { email },
            { $set: { password: hashedPassword } }
        );

        const resultEntity: UserEntity | null = updatedUserData ? mapUserModelToUserEntity(updatedUserData) : null;
        return resultEntity;
    }


    async updateHostDetails(userId: string, hostInput: UpgradeHostInput | HostUpdateInput): Promise<HostEntity | null> {
        const updatedHostData: IUserModel | null = await this.findByIdAndUpdate(userId, {$set: hostInput});

        const resultEntity: HostEntity | null = updatedHostData ? mapUserModelToHostEntity(updatedHostData) : null;
        return resultEntity;
    }



    async deleteUser(userId: string): Promise<void> {
        await this.findByIdAndDelete(userId);
    }



    async incrementWalletBalance(
        userId: string, 
        creditAmount: number,
        options: { session?: ClientSession } = {}
    ): Promise<number | null> {
        const { session } = options;

        const updated = await this.findByIdAndUpdate(
            userId,
            { $inc: { walletBalance: creditAmount } },
            { session }
        );
        return updated ? updated.walletBalance : null;
    }
    
    
    async decrementWalletBalance(
        userId: string, 
        debitAmount: number,
        options: { session?: ClientSession } = {}
    ): Promise<number | null> {
        const { session } = options;

        const updated = await this.findOneAndUpdate(
            { 
                _id : userId, 
                walletBalance: { $gte: debitAmount }  // only updates if sufficient balance
            },
            { $inc: { walletBalance: -debitAmount } },
            { session }
        );

        return updated ? updated.walletBalance : null;
    }



    async updateHostRatingStats(hostId: string, ratingAverage: number, totalReviews: number): Promise<void> {
        await this.findByIdAndUpdate(hostId, { 
            $set: { ratingAverage, totalReviews } 
        });
    }

    

    
}
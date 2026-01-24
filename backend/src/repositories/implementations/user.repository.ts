// backend/src/repositories/implementations/user.repository.ts
import User, { IUser, IUserModel } from "../../models/implementations/user.model.js";
import { BaseRepository } from "../base.repository.js";
import { IUserRepository } from "../interfaces/IUserRepository.js";
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
} from "../../entities/user.entity.js";

import { 
    mapUserModelToUserEntity, 
    mapUserModelToSensitiveUserEntity, 
    mapUserModelToHostEntity,
    mapUserModelToProfileEntity
} from "../../mappers/user.mapper.js";
import { UserStatus } from "../../constants/roles-and-statuses.js";
import { UpdateEmailDto } from "src/dtos/auth.dto.js";


import { UserFilterQuery } from '../../types/user.types.js';


export class UserRepository extends BaseRepository<IUserModel> implements IUserRepository {
    constructor() {
        super(User)
        this.model = User;
    }



    async getUserByEmail(email: string): Promise<UserEntity | null> {
        try {
            const userData: IUserModel | null = await this.findOne({email});
            const result: UserEntity | null = userData ? mapUserModelToSensitiveUserEntity(userData) : null;
            return result;
            
        } catch (error) {
            console.log('error in getUserByEmail :', error);
            throw new Error("Error Finding User");
        }
    }


    async getUserByMobile(mobile: string): Promise<UserEntity | null> {
        try {
            const userData: IUserModel | null = await this.findOne({mobile});
            const result: UserEntity | null = userData ? mapUserModelToSensitiveUserEntity(userData) : null;
            return result;
            
        } catch (error) {
            console.log('error in getUserByMobile :', error);
            throw new Error("Error Finding User");
        }
    }


    async getUserById(userId: string): Promise<UserEntity | null> {
        try {
            const userData: IUserModel | null = await this.findById(userId);
            const result: UserEntity | null = userData ? mapUserModelToUserEntity(userData) : null;
            return result;

        } catch (error) {
            console.log('error in getUserById :', error);
            throw new Error("Error Finding User");
        }
    }


    async getHostById(hostId: string): Promise<HostEntity | null> {
        try {
            const userData: IUserModel | null = await this.findById(hostId);
            const result: HostEntity | null = userData ? mapUserModelToHostEntity(userData) : null;
            return result;

        } catch (error) {
            console.log('error in getUserById :', error);
            throw new Error("Error Finding User");
        }
    }


    // to get full profile
    async getUserProfile(userId: string): Promise<UserProfileEntity | null> {
        try {
            const userData: IUserModel | null = await this.findById(userId);
            const result: UserProfileEntity | null = userData ? mapUserModelToProfileEntity(userData) : null;
            return result;
        } catch (error) {
            console.log('error in getUserProfile :', error);
            throw new Error("Error Finding User Profile");
        }
    }


    async findAuthUser(email: AuthUserCheckInput): Promise<SensitiveUserEntity | null> {
        try {
            const userData: IUserModel | null = await this.findOne(email);
            const result: SensitiveUserEntity | null = userData ? mapUserModelToSensitiveUserEntity(userData) : null;
            return result;

        } catch (error) {
            console.log('error in getUserById :', error);
            throw new Error("Error Finding User");
        }
    }


    async findUsers(query: UserFilterQuery, skip: number, limit: number): Promise<UserEntity[] | null> {
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

    
    async findHosts(query: UserFilterQuery, skip: number, limit: number): Promise<HostEntity[] | null> {
        try {
            const paginatedHosts: IUserModel[] = await this.model.find(query)
            .select('-password')
            .sort({ hostAppliedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(); // faster + easier to map

            // console.log('✅  paginatedHosts :', paginatedHosts);

            const result: HostEntity[] | null = paginatedHosts ? paginatedHosts.map(host => mapUserModelToHostEntity(host)) : null;
            return result;

        } catch (error) {
            console.log('error in findHosts :', error);
            throw new Error("Error Finding Hosts");
        }
    }


    async countUsers(query: UserFilterQuery): Promise<number> {
        try {
            const count: number = await this.countDocuments(query);
            return count;
        } catch (error) {
            console.log('error in countUsers :', error);
            throw new Error("Error Counting Users");
        }
    }


    // user registration (after verifying otp)
    async createUser(user: SignUpUserInput): Promise<UserEntity> {
        try {
            const userData: IUserModel = await this.createOne(user);
            const userEntity: UserEntity = mapUserModelToUserEntity(userData);
            return userEntity;

        } catch (error) {
            console.log('error in createUser :', error);
            throw error;
        }
    }

    
    async createUserByAdmin(userEntity: CreateUserInput): Promise<UserEntity> {
        try {
            const userData: IUserModel = await this.createOne(userEntity);
            const resultEntity: UserEntity = mapUserModelToUserEntity(userData);
            return resultEntity;

        } catch (error) {
            console.log('error in createUserByAdmin :', error);
            throw error;
        }
    }


    async updateUserByAdmin(userId: string, updateInput: UpdateUserInput): Promise<UserEntity> {
        try {
            // console.log('✅ userId received in userRepository.updateUserByAdmin:', userId);
            // console.log('✅ userEntity received in userRepository.updateUserByAdmin:', userEntity);

            const updatedUserData: IUserModel | null = await this.findByIdAndUpdate(userId, updateInput);
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


    async updateUserProfile(userId: string, updateInput: UpdateUserInput): Promise<UserEntity> {
        try {
            const updatedUserData: IUserModel | null = await this.findByIdAndUpdate(userId, updateInput);
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

    
    async updateProfilePicture(userId: string, profilPicInput: UpdateProfilePicInput): Promise<UserEntity>{
        try {
            const updatedUserData: IUserModel | null = await this.findByIdAndUpdate(userId, profilPicInput);
            if (!updatedUserData) {
                throw new Error("User not found");
            }
            const resultEntity: UserEntity = mapUserModelToUserEntity(updatedUserData);
            return resultEntity;

        } catch (error) {
            console.log('error in updateProfilePicture :', error);
            throw error;
        }
    }


    async deleteUser(userId: string): Promise<void> {
        try {
            await this.findByIdAndDelete(userId);
        } catch (error) {
            console.log('error in deleteUser :', error);
            throw error;
        }
    }


    async updateUserStatus(userId: string, newStatus: UserStatus): Promise<UserStatus> {
        try {
            const updatedUserData: IUserModel | null = await this.findByIdAndUpdate(userId, { status: newStatus });
            if (!updatedUserData) {
                throw new Error("User not found");
            }

            const updatedStatus: UserStatus = updatedUserData.status;
            return updatedStatus;

        } catch (error) {
            console.log('error in userRepository.updateUserStatus :', error);
            throw error;
        }
    }


    async updateHostStatus(hostId: string, hostStatusInput: HostManageInput): Promise<HostEntity> {
        try {
            const updatedHostData: IUserModel | null = await this.findByIdAndUpdate(hostId, hostStatusInput);
            if (!updatedHostData) {
                throw new Error("Host not found");
            }
            const resultEntity: HostEntity = mapUserModelToHostEntity(updatedHostData);
            return resultEntity;

        } catch (error) {
            console.log('error in updateHostStatus :', error);
            throw error;
        }
    }


    async updateUserEmail(userId: string, updateInput: UpdateEmailDto): Promise<UserEntity> {
        try {
            const updatedUserData: IUserModel | null = await this.findByIdAndUpdate(userId, updateInput);
            if (!updatedUserData) {
                throw new Error("User not found");
            }
            const resultEntity: UserEntity = mapUserModelToUserEntity(updatedUserData);
            return resultEntity;

        } catch (error) {
            console.log('error in userRepository.updateUserEmail :', error);
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


    async updateHostDetails(userId: string, hostInput: UpgradeHostInput | HostUpdateInput): Promise<HostEntity> {
        try {
            const updatedHostData: IUserModel | null = await this.findByIdAndUpdate(userId, hostInput);
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
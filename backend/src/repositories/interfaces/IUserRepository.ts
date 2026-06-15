// backend/src/repositories/interfaces/IUserRepository.ts
import { UserStatus } from '@/constants/roles-and-statuses';
import { 
    AuthUserCheckInput, 
    SignUpUserInput, 
    CreateUserInput, 
    UpdateUserInput,
    UpgradeHostInput,
    SensitiveUserEntity, 
    UserEntity,
    HostEntity,
    HostUpdateInput,
    UserProfileEntity,
    HostManageInput,
    UpdateProfilePicInput,
    CreateGoogleAuthUserInput,
} from '@/entities/user.entity';

import { UserFilterQuery } from '@/types/user.types';
import { ClientSession } from 'mongoose';










export interface IUserRepository {
    getUserByEmail(email: string): Promise<SensitiveUserEntity | null>;

    getUserByMobile(mobile: string): Promise<SensitiveUserEntity | null>;

    getUserById(userId: string): Promise<UserEntity | null>;

    getHostById(hostId: string): Promise<HostEntity | null>;

    getUserProfile(userId: string): Promise<UserProfileEntity | null>;

    // for internal auth use only (includes password) eg: login, change password
    findAuthUser(email: AuthUserCheckInput): Promise<SensitiveUserEntity | null>;

    findUsers(query: UserFilterQuery, skip: number, limit: number): Promise<UserEntity[] | null>;

    findHosts(query: UserFilterQuery, skip: number, limit: number): Promise<HostEntity[]>;

    countUsers(query: UserFilterQuery): Promise<number>;

    // register by user himself after verifying otp
    createUser(user: SignUpUserInput) : Promise<UserEntity>;

    createGoogleAuthUser(userInput: CreateGoogleAuthUserInput): Promise<UserEntity>;

    createUserByAdmin(userInput: CreateUserInput): Promise<UserEntity>;

    updateUserByAdmin(userId: string, updateInput: UpdateUserInput): Promise<UserEntity|null>;

    deleteUser(userId: string): Promise<void>;
    
    // update user profile by user
    updateUserProfile(userId: string, userInput: UpdateUserInput): Promise<UserEntity|null>;
    
    updateProfilePicture(userId: string, profilPicInput: UpdateProfilePicInput): Promise<UserEntity|null>;
    
    updateUserEmail(userId: string, updateInput: { email?: string; isEmailVerified: boolean }): Promise<UserEntity | null>

    updateUserPassword(email: string, hashedPassword: string): Promise<UserEntity | null>;

    updateUserStatus(userId: string, newStatus: UserStatus): Promise<UserStatus | null>;

    updateHostStatus(hostId: string, hostStatusInput: HostManageInput): Promise<HostEntity | null>;

    // for both upgrading host request & updating host details
    updateHostDetails(hostId: string, hostUpdateInput: UpgradeHostInput | HostUpdateInput): Promise<HostEntity | null>;
    // updateHostProfile(userId: string, hostEntity: Partial<HostEntity>): Promise<HostEntity>;

    incrementWalletBalance(userId: string, creditAmount: number, options?: { session?: ClientSession }): Promise<number | null>;

    decrementWalletBalance(userId: string, debitAmount: number, options?: { session?: ClientSession }): Promise<number | null>;

    startSession(): Promise<ClientSession>;

}



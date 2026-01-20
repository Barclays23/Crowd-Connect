// backend/src/repositories/interfaces/IUserRepository.ts
import { UserStatus } from '../../constants/roles-and-statuses';
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
} from '../../entities/user.entity';

import { IUserModel } from '../../models/implementations/user.model';



export interface IUserRepository {
    getUserByEmail(email: string): Promise<UserEntity | null>;

    getUserByMobile(mobile: string): Promise<UserEntity | null>;

    getUserById(userId: string): Promise<UserEntity | null>;

    getHostById(hostId: string): Promise<HostEntity | null>;

    getUserProfile(userId: string): Promise<UserProfileEntity | null>;

    // for internal auth use only (includes password) eg: login, change password
    findAuthUser(email: AuthUserCheckInput): Promise<SensitiveUserEntity | null>;

    findUsers(query: any, skip: number, limit: number): Promise<UserEntity[] | null>;

    findHosts(query: any, skip: number, limit: number): Promise<HostEntity[] | null>;

    countUsers(query: any): Promise<number>;

    // register by user himself after verifying otp
    createUser(user: SignUpUserInput) : Promise<UserEntity>;

    createUserByAdmin(userEntity: CreateUserInput): Promise<UserEntity>;

    updateUserByAdmin(userId: string, updateInput: UpdateUserInput): Promise<UserEntity>;

    deleteUser(userId: string): Promise<void>;
    
    // update user profile by user
    updateUserProfile(userId: string, userInput: UpdateUserInput): Promise<UserEntity>;
    
    updateProfilePicture(userId: string, profilPicInput: UpdateProfilePicInput): Promise<UserEntity>;
    
    updateUserEmail(userId: string, updateInput: { email?: string; isEmailVerified: boolean }): Promise<UserEntity>

    updateUserPassword(email: string, hashedPassword: string): Promise<UserEntity | null>;

    updateUserPassword(email: string, hashedPassword: string): Promise<UserEntity | null>;

    updateUserStatus(userId: string, newStatus: UserStatus): Promise<UserStatus>;

    updateHostStatus(hostId: string, hostStatusInput: HostManageInput): Promise<HostEntity>;

    // for both upgrading host request & updating host details
    updateHostDetails(hostId: string, hostUpdateInput: UpgradeHostInput | HostUpdateInput): Promise<HostEntity>;
    // updateHostProfile(userId: string, hostEntity: Partial<HostEntity>): Promise<HostEntity>;

}



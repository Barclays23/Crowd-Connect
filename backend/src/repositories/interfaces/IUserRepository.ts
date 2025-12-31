// backend/src/repositories/interfaces/IUserRepository.ts
import { 
    AuthUserCheckInput, 
    SignUpUserInput, 
    CreateUserInput, 
    UpdateUserInput,
    UpgradeHostInput,
    SensitiveUserEntity, 
    UserEntity,
    HostEntity,
    UpdateHostInput,
    UserProfileEntity,
} from '../../entities/user.entity';

import { IUserModel } from '../../models/implementations/user.model';



export interface IUserRepository {
    getUserByEmail(email: string): Promise<UserEntity | null>;

    getUserByMobile(mobile: string): Promise<UserEntity | null>;

    getUserById(userId: string): Promise<UserEntity | null>;

    getUserProfile(userId: string): Promise<UserProfileEntity | null>;

    // for internal auth use only (includes password) eg: login, change password
    findAuthUser(email: AuthUserCheckInput): Promise<SensitiveUserEntity | null>;

    findUsers(query: any, skip: number, limit: number): Promise<UserEntity[] | null>;

    countUsers(query: any): Promise<number>;

    // register by user himself after verifying otp
    createUser(user: SignUpUserInput) : Promise<UserEntity>;

    createUserByAdmin(userEntity: CreateUserInput): Promise<UserEntity>;

    updateUserByAdmin(userId: string, userEntity: UpdateUserInput): Promise<UserEntity>;
    
    updateUserProfile(userId: string, userEntity: Partial<UserEntity>): Promise<UserEntity>;
    // updateHostProfile(userId: string, userEntity: Partial<HostEntity>): Promise<HostEntity>;
    

    updateUserPassword(email: string, hashedPassword: string): Promise<UserEntity | null>;

    updateHostDetails(userId: string, hostInput: UpgradeHostInput | UpdateHostInput): Promise<HostEntity>;

}



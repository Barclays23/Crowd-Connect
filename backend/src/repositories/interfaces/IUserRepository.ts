// backend/src/repositories/interfaces/IUserRepository.ts
import { 
    CreateUserEntity, 
    SensitiveUserEntity, 
    SignUpUserEntity, 
    UserEntity,
    AuthUserCheckEntity, 
    UpdateUserEntity} from '../../entities/user.entity';

import { IUserModel } from '../../models/implementations/user.model';



export interface IUserRepository {
    findUserByEmail(email: string): Promise<UserEntity | null>;

    findUserByMobile(mobile: string): Promise<UserEntity | null>;

    findUserById(userId: string): Promise<UserEntity | null>;

    // for internal auth use only (includes password) eg: login, change password
    findAuthUser(email: AuthUserCheckEntity): Promise<SensitiveUserEntity | null>;

    findUsers(query: any, skip: number, limit: number): Promise<UserEntity[] | null>;

    countUsers(query: any): Promise<number>;

    // register by user himself after verifying otp
    createUser(user: SignUpUserEntity) : Promise<UserEntity>;

    createUserByAdmin(userEntity: CreateUserEntity): Promise<UserEntity>;

    updateUserByAdmin(userId: string, userEntity: UpdateUserEntity): Promise<UserEntity>;

    updateUserPassword(email: string, hashedPassword: string): Promise<UserEntity | null>;

}



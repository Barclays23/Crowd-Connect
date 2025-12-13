import { IUserLean } from '@shared/types';
import { IUserModel } from '../../models/implementations/user.model';



export interface IUserRepository {
    findUserByEmail(email: string): Promise<IUserModel | null>;

    createUser(user: IUserModel) : Promise<IUserModel>;

    findUserById(userId: string): Promise<IUserModel | null>;

    findUsers(query: any, skip: number, limit: number): Promise<IUserLean[]>;


}



import { IUserModel } from '../../models/implementations/user.model';



export interface IUserRepository {
    findUserByEmail(email: string): Promise<IUserModel | null>;

    createUser(user: IUserModel) : Promise<IUserModel>;


}



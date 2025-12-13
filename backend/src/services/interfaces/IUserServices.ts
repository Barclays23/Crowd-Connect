// backend/src/services/interfaces/IUserServices.ts

import { GetUsersFilter, GetUsersResult, UserDto } from "../../dtos/user.dto";



export interface IUserServices {
    getAllUsers(filters: GetUsersFilter): Promise<GetUsersResult>;
    // updateProfile(user: UserDto): Promise<string>
}
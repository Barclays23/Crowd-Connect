// backend/src/services/interfaces/IUserServices.ts

import { GetUsersFilter, GetUsersResult } from "../../types/user.types";
import { 
    CreateUserDTO, 
} from "../../dtos/user.dto";



export interface IUserServices {
    getAllUsers(filters: GetUsersFilter): Promise<GetUsersResult>;
    // updateProfile(user: ): Promise<string>
    createUserByAdmin(user: CreateUserDTO): Promise<string>
}
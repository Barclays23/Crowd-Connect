// backend/src/services/interfaces/IUserServices.ts

import { GetUsersFilter, GetUsersResult } from "../../types/user.types";
import { 
    CreateUserDTO,
    UpdateUserDTO,
    UserProfileDto, 
} from "../../dtos/user.dto";



export interface IUserServices {
  getAllUsers(filters: GetUsersFilter): Promise<GetUsersResult>;

  // updateProfile(user: ): Promise<string>

  createUserByAdmin({ createDto, imageFile }: { 
        createDto: CreateUserDTO; 
        imageFile?: Express.Multer.File 
    }): Promise<UserProfileDto>;

  editUserByAdmin({ userId, updateDto, imageFile}: {
        userId: string;
        updateDto: UpdateUserDTO;
        imageFile?: Express.Multer.File;
    }): Promise<UserProfileDto>;



}
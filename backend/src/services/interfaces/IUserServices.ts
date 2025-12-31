// backend/src/services/interfaces/IUserServices.ts

import { GetUsersFilter, GetUsersResult } from "../../types/user.types";
import { 
    CreateUserRequestDto,
    HostResponseDto,
    UpdateUserRequestDto,
    UserProfileResponseDto, 
} from "../../dtos/user.dto";



export interface IUserServices {

   getUserProfile(userId: string): Promise<UserProfileResponseDto>;

   getAllUsers(filters: GetUsersFilter): Promise<GetUsersResult>;

   // updateProfile(user: ): Promise<string>

   createUserByAdmin({ createDto, imageFile }: { 
      createDto: CreateUserRequestDto; 
      imageFile?: Express.Multer.File 
   }): Promise<UserProfileResponseDto>;

   editUserByAdmin({ userId, updateDto, imageFile}: {
      userId: string;
      updateDto: UpdateUserRequestDto;
      imageFile?: Express.Multer.File;
   }): Promise<UserProfileResponseDto>;



}
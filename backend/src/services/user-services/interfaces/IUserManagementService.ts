// backend/src/services/user/interfaces/IUserManagementService.ts

import { GetUsersFilter, GetUsersResult } from "@/types/user.types";
import { 
    CreateUserRequestDto,
    UpdateUserRequestDto,
    UserProfileResponseDto, 
} from "@/dtos/user.dto";
import { UserStatus } from "@/constants/roles-and-statuses";



export interface IUserManagementService {

   getAllUsers(filters: GetUsersFilter): Promise<GetUsersResult>;

   createUserByAdmin({ createDto, imageFile, currentAdminId }: { 
      createDto: CreateUserRequestDto; 
      imageFile?: Express.Multer.File;
      currentAdminId: string;
   }): Promise<UserProfileResponseDto>;

   editUserByAdmin({ targetUserId, currentAdminId, updateDto, imageFile}: {
      targetUserId: string;
      currentAdminId: string;
      updateDto: UpdateUserRequestDto;
      imageFile?: Express.Multer.File;
   }): Promise<UserProfileResponseDto>;


   toggleUserBlock({ targetUserId, currentAdminId }: {
      targetUserId: string; currentAdminId: string
   }): Promise<UserStatus>;

   deleteUser({ targetUserId, currentAdminId }: { 
      targetUserId: string; currentAdminId: string 
   }): Promise<void>;



}
// backend/src/services/user-services/interfaces/IUserProfileService.ts

import { 
    UserBasicInfoUpdateDTO,
    UserProfileResponseDto,
} from "@/dtos/user.dto";
import { UserEntity } from "@/entities/user.entity";



export interface IUserProfileService {

   getUserProfile(userId: string): Promise<UserProfileResponseDto>;
   
   editUserBasicInfo(userId: string, basicInfoDto: UserBasicInfoUpdateDTO): Promise<UserEntity>;

   updateProfilePicture(userId: string, imageFile?: Express.Multer.File): Promise<UserEntity>;

}
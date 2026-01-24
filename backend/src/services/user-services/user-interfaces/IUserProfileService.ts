// backend/src/services/user/interfaces/IUserProfileService.ts

import { 
    UserBasicInfoUpdateDTO,
    UserProfileResponseDto, 
} from "../../../dtos/user.dto.js";



export interface IUserProfileService {

   getUserProfile(userId: string): Promise<UserProfileResponseDto>;

   editUserBasicInfo(userId: string, basicInfoDto: UserBasicInfoUpdateDTO): Promise<UserProfileResponseDto>;

   updateProfilePicture(userId: string, imageFile?: Express.Multer.File): Promise<UserProfileResponseDto>;

}
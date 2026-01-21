// src/services/user/implementations/UserProfile.service.ts

import { 
    UserProfileResponseDto,
    UserBasicInfoUpdateDTO, 
} from "../../../dtos/user.dto";

import { createHttpError } from "../../../utils/httpError.utils";

import { 
    mapUpdateUserRequestDtoToInput, 
    mapUserEntityToProfileDto
} from "../../../mappers/user.mapper";

import { UpdateUserInput, UserEntity, UserProfileEntity } from "../../../entities/user.entity";
import { deleteFromCloudinary, uploadToCloudinary } from "../../../config/cloudinary";
import { HttpResponse } from "../../../constants/responseMessages.constants";
import { HttpStatus } from "../../../constants/statusCodes.constants";
import { UserStatus } from "../../../constants/roles-and-statuses";
import { IUserRepository } from "../../../repositories/interfaces/IUserRepository";
import { IUserProfileService } from "../user-interfaces/IUserProfileService";



export class UserProfileService implements IUserProfileService {
    constructor(
        private _userRepository: IUserRepository
    ) {}


    async getUserProfile(userId: string): Promise<UserProfileResponseDto> {
        try {
            const userData: UserProfileEntity | null = await this._userRepository.getUserProfile(userId);

            if (!userData) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

            const userProfile: UserProfileResponseDto = mapUserEntityToProfileDto(userData);

            return userProfile;

        } catch (error: any) {
            console.error('Error in UserProfileService.getUserProfile:', error);
            throw error;
        }
    }


    async editUserBasicInfo(currentUserId: string, updateDto: UserBasicInfoUpdateDTO): Promise<UserProfileResponseDto> {
        try {
            const userData: UserEntity|null = await this._userRepository.getUserById(currentUserId);
            
            if (!userData) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

            if (userData.status === UserStatus.BLOCKED) {
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.USER_ACCOUNT_BLOCKED);
            }

            const isChangingMobile = updateDto.mobile && updateDto.mobile !== userData.mobile;
            if (isChangingMobile) {
                const existingMobileUser: UserEntity | null = updateDto.mobile ? await this._userRepository.getUserByMobile(updateDto.mobile) : null;
                if (existingMobileUser && existingMobileUser.id !== currentUserId) {
                    throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.MOBILE_EXIST);
                }
            }

            // since profilePic is not included in UserBasicInfo (profilePic will update separately)
            const profilePicUrl = undefined;  // keeping it undefined for input mapping

            const updateInput: UpdateUserInput = mapUpdateUserRequestDtoToInput({updateDto, profilePicUrl});
                
            const updatedUserResult: UserEntity = await this._userRepository.updateUserProfile(currentUserId, updateInput);

            const updatedUser: UserProfileResponseDto = mapUserEntityToProfileDto(updatedUserResult);

            return updatedUser

        } catch (error: any) {
            console.error("Error in UserProfileService.editUserBasicInfo:", error);
            throw error;
        }
    }


    async updateProfilePicture(currentUserId: string, imageFile?: Express.Multer.File): Promise<UserProfileResponseDto> {
        try {
            // console.log('✅ currentUserId received in UserProfileService.updateProfilePicture:', currentUserId);
            // console.log('✅ imageFile received in UserProfileService.updateProfilePicture:', imageFile);

            const currentUser: UserEntity | null = await this._userRepository.getUserById(currentUserId);

            if (!currentUser) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

            if (currentUser.status === UserStatus.BLOCKED) {
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.USER_ACCOUNT_BLOCKED);
            }

            let newProfilePicKey: string | undefined;
            const oldProfilePicKey = currentUser.profilePic;

            if (imageFile) {
                newProfilePicKey = await uploadToS3(imageFile, 'user-profile-pics');
                console.log('✅ New S3 Key generated:', newProfilePicKey);
            }

            // Update Database only with the new KEY
            const profilPicInput = { profilePic: newProfilePicKey };
            
            const updatedUserResult: UserEntity = await this._userRepository.updateProfilePicture(currentUserId, profilPicInput);

            if (imageFile && oldProfilePicKey) {
                deleteFromS3(oldProfilePicKey).catch(err => 
                    console.error("Background profile pic delete failed:", err)
                );
            }

            const updatedProfileDto: UserProfileResponseDto = mapUserEntityToProfileDto(updatedUserResult);
            
            // The frontend needs a secured viewable link, not a database key.
            if (updatedProfileDto.profilePic) {
                updatedProfileDto.profilePic = await getPresignedUrl(updatedProfileDto.profilePic);
            }


            return updatedProfileDto;

        } catch (err: any) {
            console.error('Error in UserProfileService.updateProfilePicture:', err);
            throw err;
        }
    }


}
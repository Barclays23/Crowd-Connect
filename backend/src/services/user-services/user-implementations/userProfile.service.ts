// src/services/user/implementations/UserProfile.service.ts

import { 
    UserProfileResponseDto,
    UserBasicInfoUpdateDTO, 
} from "../../../dtos/user.dto.js";

import { createHttpError } from "../../../utils/httpError.utils.js";

import { 
    mapUpdateUserRequestDtoToInput, 
    mapUserEntityToProfileDto
} from "../../../mappers/user.mapper.js";

import { UpdateUserInput, UserEntity, UserProfileEntity } from "../../../entities/user.entity.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../../../config/cloudinary.js";
import { HttpResponse } from "../../../constants/responseMessages.constants.js";
import { HttpStatus } from "../../../constants/statusCodes.constants.js";
import { UserStatus } from "../../../constants/roles-and-statuses.js";
import { IUserRepository } from "../../../repositories/interfaces/IUserRepository.js";
import { IUserProfileService } from "../user-interfaces/IUserProfileService.js";
import { deleteFromS3, getS3PresignedUrl, uploadToS3 } from "../../../config/aws-s3.config.js";



export class UserProfileService implements IUserProfileService {
    constructor(
        private _userRepository: IUserRepository
    ) {}


    async getUserProfile(userId: string): Promise<UserProfileResponseDto> {
        try {
            const userData: UserProfileEntity | null = await this._userRepository.getUserProfile(userId);

            if (!userData) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

            const userProfileDto: UserProfileResponseDto = mapUserEntityToProfileDto(userData);

            // Convert Key to Secured S3 URL
            // if (userProfileDto.profilePic) {
            //     userProfileDto.profilePic = await getS3PresignedUrl(userProfileDto.profilePic);
            // }

            return userProfileDto;

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error in UserProfileService.getUserProfile:', msg);
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

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in UserProfileService.editUserBasicInfo:", msg);
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

            let profilePicUrl: string | undefined;

            // if (isRemoved) profilePicUrl = '';
            // if profile pic is removed, pass the isRemoved flag and replace with empty string (will implement later)

            if (imageFile){
                profilePicUrl = await uploadToCloudinary({
                    fileBuffer: imageFile.buffer,
                    folderPath: 'user-profile-pics',
                    fileType: 'image',
                });

                console.log('new profilePicUrl:', profilePicUrl);

                if (currentUser.profilePic && currentUser.profilePic.trim() !== '') {
                    try {
                        await deleteFromCloudinary({fileUrl: currentUser.profilePic, resourceType: 'image'});
                    } catch (cleanupErr) {
                        console.warn("Failed to delete user profile pic from Cloudinary:", cleanupErr);
                    }
                }
            }

            const profilPicInput = {profilePic: profilePicUrl}

            const updatedUserResult: UserEntity = await this._userRepository.updateProfilePicture(currentUserId, profilPicInput);

            const updatedProfileDto: UserProfileResponseDto = mapUserEntityToProfileDto(updatedUserResult);

            return updatedProfileDto;

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error in UserProfileService.updateProfilePicture:', msg);
            throw error;
        }
    }


}
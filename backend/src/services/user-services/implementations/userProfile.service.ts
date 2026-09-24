// src/services/user/implementations/UserProfile.service.ts
import { 
    UserBasicInfoUpdateDTO,
    UserProfileResponseDto, 
} from "@/dtos/user.dto";
import { createHttpError } from "@/utils/httpError.utils";
import { 
    mapUpdateUserRequestDtoToInput,
    mapUserEntityToProfileDto, 
} from "@/mappers/user.mapper";
import { 
    UpdateUserInput, 
    UserEntity, 
    UserProfileEntity 
} from "@/entities/user.entity";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import { IUserProfileService } from "../interfaces/IUserProfileService";
import { AUTH_MESSAGES, USER_MESSAGES } from "@/constants/messages.constants";
import { USER_STATUS } from "@/constants/user-system.constants";
import { IFileStorageService } from "@/services/file-storage-services/interfaces/IFileStorageService";




export class UserProfileService implements IUserProfileService {
    constructor(
        private readonly _userRepository: IUserRepository,
        private readonly _storageService: IFileStorageService
    ) {}


    async getUserProfile(userId: string): Promise<UserProfileResponseDto> {
        const userData: UserProfileEntity | null = await this._userRepository.getUserProfile(userId);
        
        if (!userData) throw createHttpError(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND);
        
        // Convert Key to Secured S3 URL
        // if (userProfileDto.profilePic) {
        //     userProfileDto.profilePic = await getS3PresignedUrl(userProfileDto.profilePic);
        // }

        return mapUserEntityToProfileDto(userData);
    }


    async editUserBasicInfo(currentUserId: string, updateDto: UserBasicInfoUpdateDTO): Promise<UserEntity> {
        const userData: UserEntity|null = await this._userRepository.getUserById(currentUserId);
        
        if (!userData) throw createHttpError(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND);

        if (userData.status === USER_STATUS.BLOCKED) {
            throw createHttpError(HTTP_STATUS.FORBIDDEN, USER_MESSAGES.USER_ACCOUNT_BLOCKED);
        }

        const isChangingMobile = updateDto.mobile && updateDto.mobile !== userData.mobile;
        if (isChangingMobile) {
            const existingMobileUser: UserEntity | null = updateDto.mobile ? await this._userRepository.getUserByMobile(updateDto.mobile) : null;
            if (existingMobileUser && existingMobileUser.userId !== currentUserId) {
                throw createHttpError(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.MOBILE_EXIST);
            }
        }

        // since profilePic is not included in UserBasicInfo (profilePic will update separately)
        const profilePicUrl = undefined;

        const updateInput: UpdateUserInput = mapUpdateUserRequestDtoToInput({updateDto, profilePicUrl});
        
        const updatedUser: UserEntity | null = await this._userRepository.updateUserProfile(currentUserId, updateInput);
        
        if (!updatedUser) {
            throw createHttpError(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND);
        }

        return updatedUser;
    }


    async updateProfilePicture(currentUserId: string, imageFile?: Express.Multer.File): Promise<UserEntity> {
        const currentUser: UserEntity | null = await this._userRepository.getUserById(currentUserId);

        if (!currentUser) throw createHttpError(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND);

        if (currentUser.status === USER_STATUS.BLOCKED) {
            throw createHttpError(HTTP_STATUS.FORBIDDEN, USER_MESSAGES.USER_ACCOUNT_BLOCKED);
        }

        let profilePicUrl: string | undefined;

        if (imageFile){
            profilePicUrl = await this._storageService.uploadFile(imageFile.buffer, 'user-profile-pics', 'image');

            if (currentUser.profilePic && currentUser.profilePic.trim() !== '') {
                try {
                    await this._storageService.deleteFile(currentUser.profilePic, 'image');

                } catch (cleanupErr) {
                    console.warn("Failed to delete old user profile pic from storage:", cleanupErr);
                }
            }
        }

        const profilPicInput = {profilePic: profilePicUrl}

        const updatedUser: UserEntity | null = await this._userRepository.updateProfilePicture(currentUserId, profilPicInput);

        if (!updatedUser) {
            throw createHttpError(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND);
        }

        return updatedUser;
    }




}
// src/services/user/implementations/UserManagement.service.ts

import { 
    GetUsersFilter, 
    GetUsersResult, 
    UserFilterQuery 
} from "@/types/user.types";
import { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import { IUserManagementService } from "../interfaces/IUserManagementService";
import { 
    CreateUserInput, 
    UpdateUserInput, 
    UserEntity, 
    UserProfileEntity 
} from "@/entities/user.entity";
import { 
    CreateUserRequestDto, 
    UpdateUserRequestDto, 
    UserProfileResponseDto 
} from "@/dtos/user.dto";
import { 
    mapCreateUserRequestDtoToInput, 
    mapUpdateUserRequestDtoToInput, 
    mapUserEntityToProfileDto 
} from "@/mappers/user.mapper";
import { createHttpError } from "@/utils/httpError.utils";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { ALLOWED_CREATE_ROLES, USER_ROLES, USER_STATUS, UserStatus } from "@/constants/user-system.constants";
import { generateRandomPassword } from "@/utils/password-generator.utils";
import { hashPassword } from "@/utils/bcrypt.utils";
import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";
import { 
    ADMIN_MESSAGES, 
    AUTH_MESSAGES, 
    HOST_MESSAGES, 
    SYSTEM_MESSAGES, 
    USER_MESSAGES 
} from "@/constants/messages.constants";




export class UserManagementService implements IUserManagementService {
    constructor(private _userRepository: IUserRepository) {}


    async getAllUsers(filters: GetUsersFilter): Promise<GetUsersResult> {
        try {
            // console.log('Query received in UserManagementService.getAllUsers:', filters);
            const { page, limit, search, role, status } = filters;

            const query: UserFilterQuery = {};

            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { mobile: { $regex: search, $options: 'i' } },
                ];
            }
            if (role) query.role = role;
            if (status) query.status = status;

            const skip = (page - 1) * limit;

            // console.log('Final query in UserManagementService.getAllUsers:', query);

            const [users, totalCount]: [UserEntity[] | null, number] = await Promise.all([
                this._userRepository.findUsers(query, skip, limit),
                this._userRepository.countUsers(query)
            ]);

            const mappedUsers: UserProfileResponseDto[] = users ? users.map(mapUserEntityToProfileDto) : [];

            return {
                users: mappedUsers,
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalCount: totalCount,
                    totalPages: Math.ceil(totalCount / limit),
                },
            };

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error in UserManagementService.getAllUsers:', msg);
            throw err;
        }
    }



    async createUserByAdmin({createDto, imageFile, currentAdminId}: {
        createDto: CreateUserRequestDto, 
        imageFile?: Express.Multer.File
        currentAdminId: string
    }): Promise<UserProfileResponseDto> {
        try {
            const currentAdmin: UserEntity | null = await this._userRepository.getUserById(currentAdminId);
            if (!currentAdmin) throw createHttpError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED_ACCESS);

            if (!currentAdmin.isSuperAdmin && currentAdmin.role !== USER_ROLES.ADMIN) {
                throw createHttpError(HTTP_STATUS.FORBIDDEN, SYSTEM_MESSAGES.INSUFFICIENT_PERMISSION);
            }

            if (createDto.role === USER_ROLES.ADMIN && !currentAdmin.isSuperAdmin) {
                throw createHttpError(HTTP_STATUS.FORBIDDEN, ADMIN_MESSAGES.ADMIN_CANNOT_CREATE_ADMIN);
            }

            if (!ALLOWED_CREATE_ROLES.includes(createDto.role)) {
                throw createHttpError(HTTP_STATUS.BAD_REQUEST, ADMIN_MESSAGES.INVALID_USER_ROLE_CREATION);
            }

            const existingEmailUser: UserEntity | null = await this._userRepository.getUserByEmail(createDto.email);
            if (existingEmailUser) {
                throw createHttpError(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.EMAIL_EXIST);
            }

            const existingMobileUser: UserEntity | null = createDto.mobile ? await this._userRepository.getUserByMobile(createDto.mobile) : null;
            if (existingMobileUser) {
                throw createHttpError(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.MOBILE_EXIST);
            }

            // const tempPassword = 'aaAA22@@'
            const tempPassword = generateRandomPassword(8); // temporary password, can be changed later
            const hashedPassword = await hashPassword(tempPassword);

            let profilePicUrl: string = '';

            if (imageFile) {
                profilePicUrl = await uploadToCloudinary({
                    fileBuffer: imageFile.buffer,
                    folderPath: 'user-profile-pics',
                    fileType: 'image',
                });
            }

            createDto.status = USER_STATUS.PENDING;  // status will be changed to ACTIVE once the user is logged in
            const userInput: CreateUserInput = mapCreateUserRequestDtoToInput({createDto, profilePicUrl, hashedPassword});

            const createdUserResult: UserEntity = await this._userRepository.createUserByAdmin(userInput);
            if (!createdUserResult) {
                throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, USER_MESSAGES.FAILED_CREATE_USER);
            }

            const newUser: UserProfileResponseDto = mapUserEntityToProfileDto(createdUserResult);
            
            // send email to user with temp password and instructions to change it
            // (email sending logic not implemented here)

            return newUser;

            
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error in UserManagementService.createUserByAdmin:', msg);
            throw err;
        }
    }



    async editUserByAdmin({targetUserId, currentAdminId, updateDto, imageFile}: {
        targetUserId: string;
        currentAdminId: string;
        updateDto: UpdateUserRequestDto;
        imageFile?: Express.Multer.File
    }): Promise<UserProfileResponseDto> {
        try {
            // console.log('✅ userId received in UserManagementService.editUserByAdmin:', targetUserId);
            // console.log('✅ updateDto received in UserManagementService.editUserByAdmin:', updateDto);
            // console.log('✅ imageFile received in UserManagementService.editUserByAdmin:', imageFile);

            const [targetUser, currentAdmin] = await Promise.all([
                this._userRepository.getUserById(targetUserId),
                this._userRepository.getUserById(currentAdminId)
            ]);

            if (!targetUser) throw createHttpError(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND);
            if (!currentAdmin) throw createHttpError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED_ACCESS);

            if (currentAdmin.status === USER_STATUS.BLOCKED) {
                throw createHttpError(HTTP_STATUS.FORBIDDEN, USER_MESSAGES.USER_ACCOUNT_BLOCKED);
            }

            if (!currentAdmin.isSuperAdmin && currentAdmin.role !== USER_ROLES.ADMIN) {
                throw createHttpError(HTTP_STATUS.FORBIDDEN, SYSTEM_MESSAGES.INSUFFICIENT_PERMISSION);
            }

            const isEditingSelf = targetUserId === currentAdminId;
            if (targetUser.role === USER_ROLES.ADMIN && !currentAdmin.isSuperAdmin && !isEditingSelf) {
                throw createHttpError(HTTP_STATUS.FORBIDDEN, ADMIN_MESSAGES.ADMIN_CANNOT_EDIT_ADMIN);
            }

            if (targetUser.isSuperAdmin && currentAdmin.userId !== targetUser.userId) {
                throw createHttpError(HTTP_STATUS.FORBIDDEN, ADMIN_MESSAGES.ADMIN_CANNOT_EDIT_SUPER_ADMIN);
            }

            const isChangingEmail = updateDto.email && updateDto.email !== targetUser.email;
            if (isChangingEmail) {
                if (targetUser.isEmailVerified) {
                    throw createHttpError(HTTP_STATUS.BAD_REQUEST, USER_MESSAGES.CANNOT_CHANGE_VERIFIED_EMAIL);
                }

                const existingEmailUser = await this._userRepository.getUserByEmail(updateDto.email!);
                if (existingEmailUser && existingEmailUser.userId !== targetUserId) {
                    throw createHttpError(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.EMAIL_EXIST);
                }
            }

            const isChangingMobile = updateDto.mobile !== undefined && updateDto.mobile !== targetUser.mobile;
            if (isChangingMobile) {
                if (updateDto.mobile && updateDto.mobile.trim() !== '') {
                    const existingMobileUser: UserEntity | null = await this._userRepository.getUserByMobile(updateDto.mobile);

                    if (existingMobileUser && existingMobileUser.userId !== targetUserId) {
                        throw createHttpError(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.MOBILE_EXIST);
                    }
                }
            }
            
            const isChangingRole = updateDto.role && updateDto.role !== targetUser.role;
            if (isChangingRole){
                if (targetUser.isSuperAdmin && updateDto.role !== USER_ROLES.ADMIN) {
                    throw createHttpError(HTTP_STATUS.BAD_REQUEST, ADMIN_MESSAGES.CANNOT_CHANGE_SUPER_ADMIN_ROLE);
                }

                if (targetUser.role === USER_ROLES.HOST) {
                    throw createHttpError(HTTP_STATUS.BAD_REQUEST, HOST_MESSAGES.CANNOT_CHANGE_HOST_ROLE);
                }

                if (updateDto.role === USER_ROLES.HOST) {
                    throw createHttpError(HTTP_STATUS.BAD_REQUEST, HOST_MESSAGES.CANNOT_CHANGE_HOST_DIRECTLY);
                }
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

                if (targetUser.profilePic && targetUser.profilePic.trim() !== '') {
                    try {
                        await deleteFromCloudinary({fileUrl: targetUser.profilePic, resourceType: 'image'});
                    
                    } catch (cleanupErr: unknown) {
                        const msg = cleanupErr instanceof Error ? cleanupErr.message : 'Cloudinary deletion failed';
                        console.warn("Failed to delete user profile pic from Cloudinary:", msg);
                    }
                }
            }


            const updateInput: UpdateUserInput = mapUpdateUserRequestDtoToInput({updateDto, profilePicUrl});
            
            const updatedUserResult: UserEntity|null = await this._userRepository.updateUserByAdmin(targetUserId, updateInput);

            if (!updatedUserResult) {
                throw new Error("Failed to update user. User not found.");
            }

            const updatedUser: UserProfileResponseDto = mapUserEntityToProfileDto(updatedUserResult);

            return updatedUser;

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error in UserManagementService.editUserByAdmin:', msg);
            throw err;
        }
    }



    async toggleUserBlock({targetUserId, currentAdminId}: {
        targetUserId: string;
        currentAdminId: string;
    }): Promise<UserStatus> {
        try {
            const [targetUser, currentAdmin] = await Promise.all([
                this._userRepository.getUserById(targetUserId),
                this._userRepository.getUserById(currentAdminId)
            ]);

            if (!targetUser) throw createHttpError(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND);
            if (!currentAdmin) throw createHttpError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED_ACCESS);

            if (!currentAdmin.isSuperAdmin && currentAdmin.role !== USER_ROLES.ADMIN) {
                throw createHttpError(HTTP_STATUS.FORBIDDEN, SYSTEM_MESSAGES.INSUFFICIENT_PERMISSION);
            }

            if (currentAdmin.status === USER_STATUS.BLOCKED) {
                throw createHttpError(HTTP_STATUS.FORBIDDEN, USER_MESSAGES.USER_ACCOUNT_BLOCKED);
            }

            if (currentAdmin.userId === targetUserId) {
                throw createHttpError(HTTP_STATUS.FORBIDDEN, ADMIN_MESSAGES.ADMIN_CANNOT_BLOCK_SELF);
            }

            if (targetUser.isSuperAdmin) {
                throw createHttpError(HTTP_STATUS.FORBIDDEN, ADMIN_MESSAGES.ADMIN_CANNOT_BLOCK_SUPER_ADMIN);
            }

            if (targetUser.role === USER_ROLES.ADMIN && !currentAdmin.isSuperAdmin) {
                throw createHttpError(HTTP_STATUS.FORBIDDEN, ADMIN_MESSAGES.ADMIN_CANNOT_BLOCK_ADMIN);
            }

            const newStatus = targetUser.status !== USER_STATUS.BLOCKED
                ? USER_STATUS.BLOCKED
                : USER_STATUS.PENDING;

            const updatedStatus: UserStatus|null = await this._userRepository.updateUserStatus(targetUserId, newStatus);

            if (!updatedStatus) {
                throw new Error("Failed to update user status.");
            }

            return updatedStatus;

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            console.error("Error in UserManagementService.toggleUserBlock:", msg);
            throw err;
        }
    }



    async deleteUser({ targetUserId, currentAdminId }: { 
        targetUserId: string; currentAdminId: string 
    }): Promise<void> {
        try {
            const [targetUser, currentAdmin]: [UserProfileEntity | null, UserEntity | null]
                = await Promise.all([
                    this._userRepository.getUserProfile(targetUserId),
                    this._userRepository.getUserById(currentAdminId)
            ]);

            if (!targetUser) throw createHttpError(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND);
            if (!currentAdmin) throw createHttpError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED_ACCESS);

            if (!currentAdmin.isSuperAdmin && currentAdmin.role !== USER_ROLES.ADMIN) {
                throw createHttpError(HTTP_STATUS.FORBIDDEN, SYSTEM_MESSAGES.INSUFFICIENT_PERMISSION);
            }

            if (currentAdmin.status === USER_STATUS.BLOCKED) {
                throw createHttpError(HTTP_STATUS.FORBIDDEN, USER_MESSAGES.USER_ACCOUNT_BLOCKED);
            }

            if (currentAdmin.userId === targetUserId) {
                throw createHttpError(HTTP_STATUS.FORBIDDEN, ADMIN_MESSAGES.ADMIN_CANNOT_DELETE_SELF);
            }

            if (targetUser.isSuperAdmin) {
                throw createHttpError(HTTP_STATUS.FORBIDDEN, ADMIN_MESSAGES.ADMIN_CANNOT_DELETE_SUPER_ADMIN);
            }

            if (targetUser.role === USER_ROLES.ADMIN && !currentAdmin.isSuperAdmin) {
                throw createHttpError(HTTP_STATUS.FORBIDDEN, ADMIN_MESSAGES.ADMIN_CANNOT_DELETE_ADMIN);
            }

            if (targetUser.profilePic && targetUser.profilePic.trim() !== '') {
                try {
                    await deleteFromCloudinary({fileUrl: targetUser.profilePic, resourceType: 'image'});
                } catch (cleanupErr) {
                    console.warn("Failed to delete user profile pic from Cloudinary:", cleanupErr);
                }
            }

            // also delete the host documents incase if user is host
            if (targetUser.certificateUrl && targetUser.certificateUrl.trim() !== '') {
                try {
                    await deleteFromCloudinary({fileUrl: targetUser.certificateUrl, resourceType: 'image'});
                } catch (cleanupErr) {
                    console.warn("Failed to delete host document from Cloudinary:", cleanupErr);
                }
            }

            await this._userRepository.deleteUser(targetUserId);
            return;

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error in UserManagementService.deleteUser:', msg);
            throw err;
        }
    }

}
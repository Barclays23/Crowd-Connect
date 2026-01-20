// backend/src/services/implementations/user.services.ts

import { IUserServices } from "../interfaces/IUserServices";
import { UserRepository } from "../../repositories/implementations/user.repository";
import { 
    CreateUserRequestDto, 
    UpdateUserRequestDto, 
    UserProfileResponseDto,
    HostResponseDto,
    UserBasicInfoUpdateDTO, 
} from "../../dtos/user.dto";

import { createHttpError } from "../../utils/httpError.utils";
import { hashPassword } from "../../utils/bcrypt.utils";

import { 
    mapCreateUserRequestDtoToInput, 
    mapUpdateUserRequestDtoToInput, 
    mapUserEntityToProfileDto
} from "../../mappers/user.mapper";

import { CreateUserInput, HostEntity, UpdateUserInput, UserEntity, UserProfileEntity } from "../../entities/user.entity";
import { GetUsersFilter, GetUsersResult } from "../../types/user.types";
import { deleteFromCloudinary, uploadToCloudinary } from "../../config/cloudinary";
import { HttpResponse } from "../../constants/responseMessages";
import { HttpStatus } from "../../constants/statusCodes";
import { UserRole, UserStatus } from "../../constants/roles-and-statuses";
import { generateRandomPassword } from "../../utils/password-generator.utils";
import { IUserRepository } from "../../repositories/interfaces/IUserRepository";



export class UserServices implements IUserServices {
    constructor(
        private _userRepository: UserRepository
    ) {}


    async getUserProfile(userId: string): Promise<UserProfileResponseDto> {
        try {
            const userData: UserProfileEntity | null = await this._userRepository.getUserProfile(userId);

            if (!userData) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

            const userProfile: UserProfileResponseDto = mapUserEntityToProfileDto(userData);

            return userProfile;

        } catch (error: any) {
            console.error('Error in userServices.getUserProfile:', error);
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
            console.error("Error in UserServices.editUserBasicInfo:", error);
            throw error;
        }
    }


    async updateProfilePicture(currentUserId: string, imageFile?: Express.Multer.File): Promise<UserProfileResponseDto> {
        try {
            // console.log('✅ currentUserId received in userServices.updateProfilePicture:', currentUserId);
            // console.log('✅ imageFile received in userServices.updateProfilePicture:', imageFile);

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

            const updatedUser: UserProfileResponseDto = mapUserEntityToProfileDto(updatedUserResult);

            return updatedUser;

        } catch (err: any) {
            console.error('Error in userServices.updateProfilePicture:', err);
            throw err;
        }
    }
  

    async getAllUsers(filters: GetUsersFilter): Promise<GetUsersResult> {
        try {
            // console.log('Query received in userServices.getAllUsers:', filters);
            const { page, limit, search, role, status } = filters;

            const query: any = {};

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

            // console.log('Final query in userServices.getAllUsers:', query);

            const [users, totalCount]: [UserEntity[] | null, number] = await Promise.all([
                this._userRepository.findUsers(query, skip, limit),
                this._userRepository.countUsers(query)
            ]);

            const mappedUsers: UserProfileResponseDto[] = users ? users.map(mapUserEntityToProfileDto) : [];

            return {
                users: mappedUsers,
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
            };

        } catch (err: any) {
            console.error('Error in userServices.getAllUsers:', err);
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
            if (!currentAdmin) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED_ACCESS);

            if (!currentAdmin.isSuperAdmin && currentAdmin.role !== UserRole.ADMIN) {
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.INSUFFICIENT_PERMISSION);
            }

            if (createDto.role === UserRole.ADMIN && !currentAdmin.isSuperAdmin) {
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.ADMIN_CANNOT_CREATE_ADMIN);
            }

            if (![UserRole.USER, UserRole.ADMIN].includes(createDto.role)) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.INVALID_USER_ROLE_CREATION);
            }

            const existingEmailUser: UserEntity | null = await this._userRepository.getUserByEmail(createDto.email);
            if (existingEmailUser) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.EMAIL_EXIST);
            }

            const existingMobileUser: UserEntity | null = createDto.mobile ? await this._userRepository.getUserByMobile(createDto.mobile) : null;
            if (existingMobileUser) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.MOBILE_EXIST);
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

            createDto.status = UserStatus.PENDING;  // status will be changed to ACTIVE once the user is logged in
            const userEntity: CreateUserInput = mapCreateUserRequestDtoToInput({createDto, profilePicUrl, hashedPassword});

            const createdUserResult: UserEntity = await this._userRepository.createUserByAdmin(userEntity);
            if (!createdUserResult) {
                throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, HttpResponse.FAILED_CREATE_USER);
            }

            const newUser: UserProfileResponseDto = mapUserEntityToProfileDto(createdUserResult);
            
            // send email to user with temp password and instructions to change it
            // (email sending logic not implemented here)

            return newUser;

            
        } catch (err: any) {
            console.error('Error in userServices.createUserByAdmin:', err);
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
            // console.log('✅ userId received in userServices.editUserByAdmin:', targetUserId);
            // console.log('✅ updateDto received in userServices.editUserByAdmin:', updateDto);
            // console.log('✅ imageFile received in userServices.editUserByAdmin:', imageFile);

            const [targetUser, currentAdmin] = await Promise.all([
                this._userRepository.getUserById(targetUserId),
                this._userRepository.getUserById(currentAdminId)
            ]);

            if (!targetUser) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
            if (!currentAdmin) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED_ACCESS);

            if (currentAdmin.status === UserStatus.BLOCKED) {
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.USER_ACCOUNT_BLOCKED);
            }

            if (!currentAdmin.isSuperAdmin && currentAdmin.role !== UserRole.ADMIN) {
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.INSUFFICIENT_PERMISSION);
            }

            const isEditingSelf = targetUserId === currentAdminId;
            if (targetUser.role === UserRole.ADMIN && !currentAdmin.isSuperAdmin && !isEditingSelf) {
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.ADMIN_CANNOT_EDIT_ADMIN);
            }

            if (targetUser.isSuperAdmin && currentAdmin.id !== targetUser.id) {
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.ADMIN_CANNOT_EDIT_SUPER_ADMIN);
            }

            const isChangingEmail = updateDto.email && updateDto.email !== targetUser.email;
            if (isChangingEmail) {
                if (targetUser.isEmailVerified) {
                    throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.CANNOT_CHANGE_VERIFIED_EMAIL);
                }

                const existingEmailUser = await this._userRepository.getUserByEmail(updateDto.email!);
                if (existingEmailUser && existingEmailUser.id !== targetUserId) {
                    throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.EMAIL_EXIST);
                }
            }

            const isChangingMobile = updateDto.mobile && updateDto.mobile !== targetUser.mobile;
            if (isChangingMobile) {
                const existingMobileUser: UserEntity | null = await this._userRepository.getUserByMobile(updateDto.mobile!);
                if (existingMobileUser && existingMobileUser.id !== targetUserId) {
                    throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.MOBILE_EXIST);
                }
            }
            
            const isChangingRole = updateDto.role && updateDto.role !== targetUser.role;
            if (isChangingRole){
                if (targetUser.isSuperAdmin && updateDto.role !== UserRole.ADMIN) {
                    throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.CANNOT_CHANGE_SUPER_ADMIN_ROLE);
                }

                if (targetUser.role === UserRole.HOST) {
                    throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.CANNOT_CHANGE_HOST_ROLE);
                }

                if (updateDto.role === UserRole.HOST) {
                    throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.CANNOT_CHANGE_HOST_DIRECTLY);
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
                    } catch (cleanupErr) {
                        console.warn("Failed to delete user profile pic from Cloudinary:", cleanupErr);
                    }
                }
            }


            const updateInput: UpdateUserInput = mapUpdateUserRequestDtoToInput({updateDto, profilePicUrl});
            
            const updatedUserResult: UserEntity = await this._userRepository.updateUserByAdmin(targetUserId, updateInput);

            const updatedUser: UserProfileResponseDto = mapUserEntityToProfileDto(updatedUserResult);

            return updatedUser;

        } catch (err: any) {
            console.error('Error in userServices.editUserByAdmin:', err);
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

            if (!targetUser) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
            if (!currentAdmin) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED_ACCESS);

            if (!currentAdmin.isSuperAdmin && currentAdmin.role !== UserRole.ADMIN) {
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.INSUFFICIENT_PERMISSION);
            }

            if (currentAdmin.status === UserStatus.BLOCKED) {
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.USER_ACCOUNT_BLOCKED);
            }

            if (currentAdmin.id === targetUserId) {
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.ADMIN_CANNOT_BLOCK_SELF);
            }

            if (targetUser.isSuperAdmin) {
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.ADMIN_CANNOT_BLOCK_SUPER_ADMIN);
            }

            if (targetUser.role === UserRole.ADMIN && !currentAdmin.isSuperAdmin) {
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.ADMIN_CANNOT_BLOCK_ADMIN);
            }

            const newStatus = targetUser.status !== UserStatus.BLOCKED
                ? UserStatus.BLOCKED
                : UserStatus.PENDING;

            const updatedStatus: UserStatus = await this._userRepository.updateUserStatus(targetUserId, newStatus);

            return updatedStatus;

        } catch (err: any) {
            console.error("Error in userServices.toggleUserBlock:", err);
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

            if (!targetUser) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
            if (!currentAdmin) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED_ACCESS);

            if (!currentAdmin.isSuperAdmin && currentAdmin.role !== UserRole.ADMIN) {
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.INSUFFICIENT_PERMISSION);
            }

            if (currentAdmin.status === UserStatus.BLOCKED) {
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.USER_ACCOUNT_BLOCKED);
            }

            if (currentAdmin.id === targetUserId) {
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.ADMIN_CANNOT_DELETE_SELF);
            }

            if (targetUser.isSuperAdmin) {
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.ADMIN_CANNOT_DELETE_SUPER_ADMIN);
            }

            if (targetUser.role === UserRole.ADMIN && !currentAdmin.isSuperAdmin) {
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.ADMIN_CANNOT_DELETE_ADMIN);
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

        } catch (err: any) {
            console.error('Error in userServices.deleteUser:', err);
            throw err;
        }
    }




    // async updateProfile(user: UserDto): Promise<string> {
    //     try {
    //         const userData = await this._userRepository.getUserByEmail(user.email) as ... | null;
    //         if (!userData) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND)

    //         // const hashedPassword = await hashPassword(user.password);

    //         const RedisRegisterData = await redisClient.get(user.email);
    //         if (RedisRegisterData) {
    //             const parsedData = JSON.parse(RedisRegisterData);
    //             console.log("Redis Data For Registration:", parsedData);
    //         }


    //         if (!response) {
    //             throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, HttpResponse.INTERNAL_SERVER_ERROR);
    //         }

    
    //         return user.email

    //     } catch (error) {
    //         console.error("Error in AuthServices.signUp:", error);
    //         throw error;
    //     }
    // }






}
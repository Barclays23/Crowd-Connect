// src/controllers/implementations/user.controller.ts

import { Request, Response, NextFunction } from 'express';
import { IUserController } from '../interfaces/IUserController';
import { HTTP_STATUS } from '@/constants/http-status.constants';
import { AUTH_MESSAGES, USER_MESSAGES } from '@/constants/messages.constants';
import { GetUsersFilter, GetUsersResult } from '@/types/user.types';
import { 
    CreateUserRequestDto, 
    UpdateUserRequestDto, 
    UserBasicInfoUpdateDTO, 
    UserProfileResponseDto 
} from '@/dtos/user.dto';
import { IUserProfileService } from '@/services/user-services/interfaces/IUserProfileService';
import { IUserManagementService } from '@/services/user-services/interfaces/IUserManagementService';
import { IPasswordService } from '@/services/password-services/interfaces/IPasswordService';
import { USER_STATUS, UserRole, UserStatus } from '@/constants/user-system.constants';
import { mapUserEntityToProfileDto } from '@/mappers/user.mapper';
import { UserEntity, UserProfileEntity } from '@/entities/user.entity';
import { createHttpError } from '@/utils/httpError.utils';
import { ApiResponse } from '@/utils/apiResponse.utils';




export class UserController implements IUserController {
    constructor(
        private _userProfileServices: IUserProfileService,
        private _userManagementServices: IUserManagementService,
        private _passwordService: IPasswordService,
    ) {}


    async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_INFORMATION_MISSING);
            }
            const userId = req.user.userId;
            const userEntity: UserProfileEntity  = await this._userProfileServices.getUserProfile(userId);

            const userProfile: UserProfileResponseDto = mapUserEntityToProfileDto(userEntity);

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success<UserProfileResponseDto>(USER_MESSAGES.SUCCESS_GET_USER_PROFILE, userProfile)
            );

            // res.status(HTTP_STATUS.OK).json({
            //     success: true,
            //     message: USER_MESSAGES.SUCCESS_GET_USER_PROFILE,
            //     data: userProfile,
            // });

        } catch (err: unknown) {
            next(err);
        };
    }


    async editUserBasicInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_INFORMATION_MISSING);
            }

            const userId: string = req.user.userId;
            const basicInfoDto: UserBasicInfoUpdateDTO = req.body;

            const updatedUser: UserEntity = await this._userProfileServices.editUserBasicInfo(userId, basicInfoDto);

            const updatedUserBasicInfo = {
                name: updatedUser.name,
                mobile: updatedUser.mobile
            }

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success(USER_MESSAGES.SUCCESS_UPDATE_PROFILE, updatedUserBasicInfo)
            );
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: USER_MESSAGES.SUCCESS_UPDATE_PROFILE,
                data: updatedUserBasicInfo,
            });


        } catch (err: unknown) {
            next(err);
        };
    }



    async changeUserPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.email) {
                throw createHttpError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.EMAIL_MISSING);
            }

            const {currentPassword, newPassword} = req.body;
            const userEmail: string = req.user.email;

            await this._passwordService.changeUserPassword(userEmail, {currentPassword, newPassword});

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success(AUTH_MESSAGES.PASSWORD_CHANGE_SUCCESS)
            );
            
            // res.status(HTTP_STATUS.OK).json({
            //     success: true,
            //     message: AUTH_MESSAGES.PASSWORD_CHANGE_SUCCESS
            // });


        } catch (err: unknown) {
            next(err);
        };
    }



    async updateProfilePicture(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "Unauthorized: User information missing" });
                return;
            }

            const userId: string = req.user.userId;
            const imageFile: Express.Multer.File | undefined = req.file;

            console.log('updateProfilePicture imageFile: ', req?.file);

            const updatedUser: UserEntity = await this._userProfileServices.updateProfilePicture(userId, imageFile);            

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success(USER_MESSAGES.PROFILE_PICTURE_CHANGED, { profilePic: updatedUser.profilePic })
            );
            
            // res.status(HTTP_STATUS.OK).json({
            //     success: true,
            //     message: USER_MESSAGES.PROFILE_PICTURE_CHANGED,
            //     data: { 
            //         profilePic: updatedUser.profilePic,
            //     },
            // });

        } catch (err: unknown) {
            next(err);
        };
    }



    async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;
            const search = (req.query.search as string)?.trim() || '';
            const role = (req.query.role as string)?.trim() || '';
            const status = (req.query.status as string)?.trim() || '';

            const filters: GetUsersFilter = {
                page,
                limit,
                search,
                role: role ? role as UserRole : undefined,
                status: status ? status as UserStatus : undefined,
            };

            console.log('✅ Parsed filters for admin getAllUsers:', filters);

            const result: GetUsersResult = await this._userManagementServices.getAllUsers(filters);

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success<UserProfileResponseDto[] | null>(
                    USER_MESSAGES.SUCCESS_GET_USERS, 
                    result.users, 
                    result.pagination
                )
            );

            // res.status(HTTP_STATUS.OK).json({
            //     success: true,
            //     message: USER_MESSAGES.SUCCESS_GET_USERS,
            //     data: result.users,
            //     pagination: result.pagination,
            // });


        } catch (err: unknown) {
            next(err);
        };
    
    }



    async createUserByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_INFORMATION_MISSING);
            }
            const createDto: CreateUserRequestDto = req.body;
            const imageFile: Express.Multer.File | undefined = req.file;
            const currentAdminId: string = req.user.userId;

            const createdUser: UserEntity = await this._userManagementServices.createUserByAdmin({
                createDto, 
                imageFile,
                currentAdminId
            });

            const userData: UserProfileResponseDto = mapUserEntityToProfileDto(createdUser);

            res.status(HTTP_STATUS.CREATED).json(
                ApiResponse.success<UserProfileResponseDto>(USER_MESSAGES.SUCCESS_CREATE_USER, userData)
            );

            // res.status(HTTP_STATUS.CREATED).json({
            //     success: true,
            //     message: USER_MESSAGES.SUCCESS_CREATE_USER,
            //     data: userData,
            // });


        } catch (err: unknown) {
            next(err);
        };
    }



    async editUserByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_INFORMATION_MISSING);
            }

            const targetUserId = req.params.id as string;
            const currentAdminId: string = req.user.userId;
            const updateDto: UpdateUserRequestDto = req.body;
            const imageFile: Express.Multer.File | undefined = req.file;

            const updatedUser: UserEntity = await this._userManagementServices.editUserByAdmin({
                targetUserId, 
                currentAdminId,
                updateDto, 
                imageFile
            });

            const userData: UserProfileResponseDto = mapUserEntityToProfileDto(updatedUser);

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success<UserProfileResponseDto>(USER_MESSAGES.SUCCESS_UPDATE_USER, userData)
            );

            // res.status(HTTP_STATUS.OK).json({
            //     success: true,
            //     message: USER_MESSAGES.SUCCESS_UPDATE_USER,
            //     data: userData,
            // });

        } catch (err: unknown) {
            next(err);
        };
    }



    async toggleUserBlock(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_INFORMATION_MISSING);
            }

            const targetUserId = req.params.id as string;
            const currentAdminId: string = req.user.userId;

            const updatedStatus: UserStatus = await this._userManagementServices.toggleUserBlock({ targetUserId, currentAdminId });

            const responseMessage = updatedStatus === USER_STATUS.BLOCKED
                ? USER_MESSAGES.SUCCESS_BLOCK_USER
                : USER_MESSAGES.SUCCESS_UNBLOCK_USER;

            console.log('✅ updatedStatus:', updatedStatus, ', responseMessage:', responseMessage);

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success(responseMessage, { status: updatedStatus })
            );

            // res.status(HTTP_STATUS.OK).json({
            //     success: true,
            //     message: responseMessage,
            //     data: { status: updatedStatus },
            // });


        } catch (err: unknown) {
            next(err);
        };
    }


    async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_INFORMATION_MISSING);
            }
            
            const targetUserId = req.params.id as string;
            const currentAdminId: string = req.user.userId;

            await this._userManagementServices.deleteUser({ targetUserId, currentAdminId });

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success(USER_MESSAGES.SUCCESS_DELETE_USER)
            );

            // res.status(HTTP_STATUS.OK).json({
            //     success: true,
            //     message: USER_MESSAGES.SUCCESS_DELETE_USER,
            // });

        } catch (err: unknown) {
            next(err);
        };
    }




}

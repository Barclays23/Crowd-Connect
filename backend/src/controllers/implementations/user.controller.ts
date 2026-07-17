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
import { UserRole, UserStatus } from '@/constants/user-system.constants';




export class UserController implements IUserController {
    constructor(
        private _userProfileServices: IUserProfileService,
        private _userManagementServices: IUserManagementService,
        private _passwordService: IPasswordService,
    ) {}


    async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "Unauthorized: User information missing" });
                return;
            }
            const userId = req.user.userId;
            const userProfile: UserProfileResponseDto = await this._userProfileServices.getUserProfile(userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: USER_MESSAGES.SUCCESS_GET_USER_PROFILE,
                data: userProfile,
            });

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in userController.getUserProfile:', msg);
            next(err);
        };
    }


    async editUserBasicInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "Unauthorized: User information missing" });
                return;
            }

            const userId: string = req.user.userId;
            const basicInfoDto: UserBasicInfoUpdateDTO = req.body;

            const updatedUser: UserProfileResponseDto = await this._userProfileServices.editUserBasicInfo(userId, basicInfoDto);

            const updatedUserBasicInfo = {
                name: updatedUser.name,
                mobile: updatedUser.mobile
            }
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: USER_MESSAGES.SUCCESS_UPDATE_PROFILE,
                data: updatedUserBasicInfo,
            });


        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in UserController.editUserBasicInfo:', msg);
            next(err);
        };
    }



    async changeUserPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.email) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "Unauthorized: User email missing" });
                return;
            }

            const {currentPassword, newPassword} = req.body;
            const userEmail: string = req.user.email;

            console.log('changeUserPassword body: ', req.body)

            await this._passwordService.changeUserPassword(userEmail, {currentPassword, newPassword});
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: AUTH_MESSAGES.PASSWORD_CHANGE_SUCCESS
            });


        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in UserController.changeUserPassword:', msg);
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

            const updatedUser: UserProfileResponseDto = await this._userProfileServices.updateProfilePicture(userId, imageFile);
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: USER_MESSAGES.PROFILE_PICTURE_CHANGED,
                data: { 
                    profilePic: updatedUser.profilePic,
                },
            });

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in UserController.updateProfilePicture:', msg);
            next(err);
        };
    }



    async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Properly extract and parse query params
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
            // console.log('✅ Result in userController.getAllUsers:', result);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: USER_MESSAGES.SUCCESS_GET_USERS,
                data: result.users,
                pagination: result.pagination,
            });


        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in userController.getAllUsers:', msg);
            next(err);
        };
    
    }



    async createUserByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "Unauthorized: Admin information missing" });
                return;
            }
            const createDto: CreateUserRequestDto = req.body;
            const imageFile: Express.Multer.File | undefined = req.file;
            const currentAdminId: string = req.user.userId;

            const createdUser: UserProfileResponseDto = await this._userManagementServices.createUserByAdmin({
                createDto, 
                imageFile,
                currentAdminId
            });

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: USER_MESSAGES.SUCCESS_CREATE_USER,
                data: createdUser,
            });


        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in userController.createUserByAdmin:', msg);
            next(err);
        };
    }



    async editUserByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "Unauthorized: Admin information missing" });
                return;
            }

            const targetUserId = req.params.id as string;
            const currentAdminId: string = req.user.userId;
            const updateDto: UpdateUserRequestDto = req.body;
            const imageFile: Express.Multer.File | undefined = req.file;

            const updatedUser: UserProfileResponseDto = await this._userManagementServices.editUserByAdmin({
                targetUserId, 
                currentAdminId,
                updateDto, 
                imageFile
            });

            // console.log('✅ updatedUser in userController.editUserByAdmin:', updatedUser);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: USER_MESSAGES.SUCCESS_UPDATE_USER,
                data: updatedUser,
            });

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in userController.editUserByAdmin:', msg);
            next(err);
        };
    }



    async toggleUserBlock(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "Unauthorized: Admin information missing" });
                return;
            }

            const targetUserId = req.params.id as string;
            const currentAdminId: string = req.user.userId;

            const updatedStatus: UserStatus = await this._userManagementServices.toggleUserBlock({ targetUserId, currentAdminId });

            const responseMessage = updatedStatus === 'blocked'
                ? USER_MESSAGES.SUCCESS_BLOCK_USER
                : USER_MESSAGES.SUCCESS_UNBLOCK_USER;

            console.log('✅ updatedStatus:', updatedStatus, ', responseMessage:', responseMessage);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: responseMessage,
                data: { status: updatedStatus },
            });


        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in userController.toggleUserBlock:', msg);
            next(err);
        };
    }


    async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.userId) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: "Unauthorized: Admin information missing" });
                return;
            }
            
            const targetUserId = req.params.id as string;
            const currentAdminId: string = req.user.userId;

            await this._userManagementServices.deleteUser({ targetUserId, currentAdminId });

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: USER_MESSAGES.SUCCESS_DELETE_USER,
            });

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in userController.deleteUser:', msg);
            next(err);
        };
    }




}



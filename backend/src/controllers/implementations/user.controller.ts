// src/controllers/implementations/user.controller.ts

import { Request, Response, NextFunction } from 'express';
import { IUserController } from '../interfaces/IUserController';
import { HttpStatus } from '@/constants/statusCodes.constants';
import { HttpResponse } from '@/constants/responseMessages.constants';
import { GetUsersFilter, GetUsersResult } from '@/types/user.types';
import { CreateUserRequestDto, UpdateUserRequestDto, UserBasicInfoUpdateDTO, UserProfileResponseDto } from '@/dtos/user.dto';
import { UserRole, UserStatus } from '@/constants/roles-and-statuses';
import { IUserProfileService } from '@/services/user-services/interfaces/IUserProfileService';
import { IUserManagementService } from '@/services/user-services/interfaces/IUserManagementService';




export class UserController implements IUserController {
    constructor(
        private _userProfileServices: IUserProfileService,
        private _userManagementServices: IUserManagementService
    ) {}


    async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            const userProfile: UserProfileResponseDto = await this._userProfileServices.getUserProfile(userId);

            res.status(HttpStatus.OK).json({
                success: true,
                userProfile,
                message: HttpResponse.SUCCESS_GET_USERS,
            });

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in userController.getUserProfile:', msg);
            next(err);
        };
    }


    async editUserBasicInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const basicInfoDto: UserBasicInfoUpdateDTO = req.body;
            const userId: string = req.user.userId;

            console.log('editUserBasicInfo body: ', req.body)

            const updatedUser: UserProfileResponseDto = await this._userProfileServices.editUserBasicInfo(userId, basicInfoDto);

            const updatedUserBasicInfo = {
                name: updatedUser.name,
                mobile: updatedUser.mobile
            }
            
            res.status(HttpStatus.OK).json({
                success: true,
                updatedUser: updatedUserBasicInfo,
                message: HttpResponse.SUCCESS_UPDATE_PROFILE
            });


        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in UserController.editUserBasicInfo:', msg);
            next(err);
        };
    }



    async updateProfilePicture(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId: string = req.user.userId;
            const imageFile: Express.Multer.File | undefined = req.file;

            console.log('updateProfilePicture imageFile: ', req?.file);

            const updatedUser: UserProfileResponseDto = await this._userProfileServices.updateProfilePicture(userId, imageFile);
            
            res.status(HttpStatus.OK).json({
                success: true,
                updatedProfilePic: updatedUser.profilePic,
                message: HttpResponse.PROFILE_PICTURE_CHANGED
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

            res.status(HttpStatus.OK).json({
                success: true,
                message: HttpResponse.SUCCESS_GET_USERS,
                usersData: result.users,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / result.limit),
                },
            });


        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in userController.getAllUsers:', msg);
            next(err);
        };
    
    }



    async createUserByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('✅ body received in userController.createUserByAdmin:', req.body);
            console.log('✅ file received in userController.createUserByAdmin:', req.file);
            const createDto: CreateUserRequestDto = req.body;
            const imageFile: Express.Multer.File | undefined = req.file;
            const currentAdminId: string = req.user.userId;

            const createdUser: UserProfileResponseDto = await this._userManagementServices.createUserByAdmin({
                createDto, 
                imageFile,
                currentAdminId
            });

            res.status(HttpStatus.CREATED).json({
                success: true,
                message: HttpResponse.SUCCESS_CREATE_USER,
                userData: createdUser,
            });


        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in userController.createUserByAdmin:', msg);
            next(err);
        };
    }



    async editUserByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // console.log('✅ params received in userController.editUserByAdmin:', req.params);
            // console.log('✅ body received in userController.editUserByAdmin:', req.body);
            // console.log('✅ file received in userController.editUserByAdmin:', req.file);

            const targetUserId: string = req.params.id;
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
            
            res.status(HttpStatus.OK).json({
                success: true,
                message: HttpResponse.SUCCESS_UPDATE_USER,
                userData: updatedUser,
            });

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in userController.editUserByAdmin:', msg);
            next(err);
        };
    }



    async toggleUserBlock(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const targetUserId: string = req.params.id;
            const currentAdminId: string = req.user.userId;

            const updatedStatus: UserStatus = await this._userManagementServices.toggleUserBlock({ targetUserId, currentAdminId });

            const responseMessage = updatedStatus === 'blocked'
                ? HttpResponse.SUCCESS_BLOCK_USER
                : HttpResponse.SUCCESS_UNBLOCK_USER;

            console.log('✅ updatedStatus:', updatedStatus, ', responseMessage:', responseMessage);

            res.status(HttpStatus.OK).json({
                success: true,
                message: responseMessage,
                updatedStatus,
            });


        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in userController.toggleUserBlock:', msg);
            next(err);
        };
    }


    async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const targetUserId: string = req.params.id;
            const currentAdminId: string = req.user.userId;

            await this._userManagementServices.deleteUser({ targetUserId, currentAdminId });

            res.status(HttpStatus.OK).json({
                success: true,
                message: HttpResponse.SUCCESS_DELETE_USER,
            });

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in userController.deleteUser:', msg);
            next(err);
        };
    }




}



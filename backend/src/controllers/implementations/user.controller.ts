// src/controllers/implementations/user.controller.ts

import { Request, Response, NextFunction } from 'express';
import { IUserController } from '../interfaces/IUserController';
import { IUserServices } from '../../services/interfaces/IUserServices';
import { HttpStatus } from '../../constants/statusCodes';
import { HttpResponse } from '../../constants/responseMessages';
import { GetUsersFilter, GetUsersResult } from '../../types/user.types';
import { CreateUserRequestDto, HostResponseDto, UpdateUserRequestDto, UserBasicInfoUpdateDTO, UserProfileResponseDto } from '../../dtos/user.dto';
import { UserStatus } from '../../constants/roles-and-statuses';




export class UserController implements IUserController {
    constructor(private _userServices: IUserServices) {
    }


    async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            const userProfile: UserProfileResponseDto = await this._userServices.getUserProfile(userId);

            res.status(HttpStatus.OK).json({
                success: true,
                userProfile,
                message: HttpResponse.SUCCESS_GET_USERS,
            });

        } catch (err: any) {
            next(err);
            console.error('Error in userController.getUserProfile:', err);

            // If a well-formed HTTP error was thrown, forward its status and message
            if (err && typeof err.statusCode === 'number') {
                res.status(err.statusCode).json({ message: err.message || 'Error' });
                return;
            }
            // Fallback to generic internal error
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: `${HttpResponse.INTERNAL_SERVER_ERROR} \n ${HttpResponse.FAILED_GET_USERS}`
            });
            return;
        }
    }


    async editUserBasicInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const basicInfoDto: UserBasicInfoUpdateDTO = req.body;
            const userId: string = req.user.userId;

            console.log('editUserBasicInfo body: ', req.body)

            const updatedUser: UserProfileResponseDto = await this._userServices.editUserBasicInfo(userId, basicInfoDto);

            const updatedUserBasicInfo = {
                name: updatedUser.name,
                mobile: updatedUser.mobile
            }
            
            res.status(HttpStatus.OK).json({
                success: true,
                updatedUser: updatedUserBasicInfo,
                message: HttpResponse.SUCCESS_UPDATE_PROFILE
            });


        } catch (err: any) {
            console.error('Error in UserController.editUserBasicInfo:', err);
            if (err && typeof err.statusCode === 'number') {
                res.status(err.statusCode).json({ message: err.message || 'Error' });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: HttpResponse.INTERNAL_SERVER_ERROR
            });
            return;
        }
    }



    async updateProfilePicture(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId: string = req.user.userId;
            const imageFile: Express.Multer.File | undefined = req.file;

            console.log('updateProfilePicture imageFile: ', req?.file);

            const updatedUser: UserProfileResponseDto = await this._userServices.updateProfilePicture(userId, imageFile);
            
            res.status(HttpStatus.OK).json({
                success: true,
                updatedProfilePic: updatedUser.profilePic,
                message: HttpResponse.PROFILE_PICTURE_CHANGED
            });


        } catch (err: any) {
            console.error('Error in UserController.updateProfilePicture:', err);
            if (err && typeof err.statusCode === 'number') {
                res.status(err.statusCode).json({ message: err.message || 'Error' });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: HttpResponse.INTERNAL_SERVER_ERROR
            });
            return;
        }
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
                role: role || undefined,
                status: status || undefined,
            };

            console.log('✅ Parsed filters for admin getAllUsers:', filters);

            const result: GetUsersResult = await this._userServices.getAllUsers(filters);
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

        } catch (err: any) {
            next(err);
            console.error('Error in userController.getAllUsers:', err);

            // If a well-formed HTTP error was thrown, forward its status and message
            if (err && typeof err.statusCode === 'number') {
                res.status(err.statusCode).json({ message: err.message || 'Error' });
                return;
            }
            // Fallback to generic internal error
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: `${HttpResponse.INTERNAL_SERVER_ERROR} \n ${HttpResponse.FAILED_GET_USERS}`
            });
            return;
        }
    
    }



    async createUserByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('✅ body received in userController.createUserByAdmin:', req.body);
            console.log('✅ file received in userController.createUserByAdmin:', req.file);
            const createDto: CreateUserRequestDto = req.body;
            const imageFile: Express.Multer.File | undefined = req.file;
            const currentAdminId: string = req.user.userId;

            const createdUser: UserProfileResponseDto = await this._userServices.createUserByAdmin({
                createDto, 
                imageFile,
                currentAdminId
            });

            res.status(HttpStatus.CREATED).json({
                success: true,
                message: HttpResponse.SUCCESS_CREATE_USER,
                userData: createdUser,
            });

        } catch (err: any) {
            next(err);
            console.error('Error in userController.createUserByAdmin:', err);
            if (err && typeof err.statusCode === 'number') {
                res.status(err.statusCode).json({ message: err.message || 'Error' });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: `${HttpResponse.INTERNAL_SERVER_ERROR} \n ${HttpResponse.FAILED_CREATE_USER}`
            });
            return;
        }
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

            const updatedUser: UserProfileResponseDto = await this._userServices.editUserByAdmin({
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

        } catch (err: any) {
            next(err);
            console.error('Error in userController.editUserByAdmin:', err);
            if (err && typeof err.statusCode === 'number') {
                res.status(err.statusCode).json({ message: err.message || 'Error' });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: `${HttpResponse.INTERNAL_SERVER_ERROR} \n ${HttpResponse.FAILED_UPDATE_USER}`
            });
            return;
        }
    }



    async toggleUserBlock(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const targetUserId: string = req.params.id;
            const currentAdminId: string = req.user.userId;

            const updatedStatus: UserStatus = await this._userServices.toggleUserBlock({ targetUserId, currentAdminId });

            const responseMessage = updatedStatus === 'blocked'
                ? HttpResponse.SUCCESS_BLOCK_USER
                : HttpResponse.SUCCESS_UNBLOCK_USER;

            console.log('✅ updatedStatus:', updatedStatus, ', responseMessage:', responseMessage);

            res.status(HttpStatus.OK).json({
                success: true,
                message: responseMessage,
                updatedStatus,
            });

        } catch (err: any) {
            next(err);
            console.error('Error in userController.toggleUserBlock:', err);
            if (err && typeof err.statusCode === 'number') {
                res.status(err.statusCode).json({ message: err.message || 'Error' });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: `${HttpResponse.INTERNAL_SERVER_ERROR} \n ${HttpResponse.FAILED_UPDATE_USER_STATUS}`
            });
            return;
        }
    }


    async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const targetUserId: string = req.params.id;
            const currentAdminId: string = req.user.userId;

            await this._userServices.deleteUser({ targetUserId, currentAdminId });

            res.status(HttpStatus.OK).json({
                success: true,
                message: HttpResponse.SUCCESS_DELETE_USER,
            });

        } catch (err: any) {
            next(err);
            console.error('Error in userController.deleteUser:', err);
            if (err && typeof err.statusCode === 'number') {
                res.status(err.statusCode).json({ message: err.message || 'Error' });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: `${HttpResponse.INTERNAL_SERVER_ERROR} \n ${HttpResponse.FAILED_DELETE_USER}`
            });
            return;
        }
    }




}



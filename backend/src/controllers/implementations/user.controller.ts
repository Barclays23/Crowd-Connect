// src/controllers/implementations/user.controller.ts

import { Request, Response, NextFunction } from 'express';
import { IUserController } from '../interfaces/IUserController';
import { IUserServices } from '../../services/interfaces/IUserServices';
import { HttpStatus } from '../../constants/statusCodes';
import { HttpResponse } from '../../constants/responseMessages';
import { createHttpError } from '../../utils/httpError.utils';
import { GetUsersResult } from '../../types/user.types';




export class UserController implements IUserController {
    constructor(private _userServices: IUserServices) {
    }


    // get all users (admin)
    async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Properly extract and parse query params
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = parseInt(req.query.limit as string, 10) || 10;
            const search = (req.query.search as string)?.trim() || '';
            const role = (req.query.role as string)?.trim() || '';
            const status = (req.query.status as string)?.trim() || '';

            const filters = {
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



    async editUserByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('✅ params received in userController.editUserByAdmin:', req.params);
            console.log('✅ body received in userController.editUserByAdmin:', req.body);
            console.log('✅ file received in userController.editUserByAdmin:', req.file);
            
            const userId = req.params.id;
            const formData = req.body;

            // If profilePic is being uploaded as a file
            if (req.file) {
                formData.profilePic = req.file.path; // or however you handle file paths
            }

            // const updatedUser = await this._userServices.editUserByAdmin(userId, formData);
            // res.status(HttpStatus.OK).json({
            //     success: true,
            //     message: HttpResponse.SUCCESS_UPDATE_USER,
            //     user: updatedUser,
            // });

        } catch (err: any) {
            next(err);
            console.error('Error in userController.editUserByAdmin:', err);
            if (err && typeof err.statusCode === 'number') {
                res.status(err.statusCode).json({ message: err.message || 'Error' });
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: `${HttpResponse.INTERNAL_SERVER_ERROR} \n ${HttpResponse.FAILED_GET_USERS}`
            });
            return;
        }
    }




}



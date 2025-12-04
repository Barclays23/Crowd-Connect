// src/controllers/implementations/auth.controller.ts

import {Request, Response, NextFunction} from "express";
import { IAuthService } from "../../services/interfaces/IAuthServices";
import {IAuthController} from "../interfaces/IAuthController";
import { HttpStatus } from "../../constants/statusCodes";
import { HttpResponse } from "../../constants/responseMessages";
import { verifyRefreshToken } from "../../utils/jwt.utils";
import { redisClient } from "../../config/redis.config";
import { createHttpError } from "../../utils/httpError.utils";
import { clearRefreshTokenCookie, setRefreshTokenCookie } from "../../utils/refreshCookie.utils";
import { SignInRequestDto } from "../../dtos/auth.dto";




export class AuthController implements IAuthController {
    constructor(private _authService: IAuthService) {
    }

    async signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body as SignInRequestDto;

            const { verifiedUser, accessToken, refreshToken } = await this._authService.signIn(email, password);
            // console.log('user in authController.signIn:', verifiedUser);

            // Set refresh token in HTTP-Only cookie
            setRefreshTokenCookie(res, refreshToken);

            res.status(HttpStatus.OK).json({
                message: `${HttpResponse.LOGIN_SUCCESS}`,
                user: verifiedUser,  // already safe user data from services
                accessToken
            });

        } catch (err: any) {
            // throw new Error(`Internal server error! \n Failed to login`);
            next(err);
            console.error('Error in AuthController.signIn:', err);

            // If a well-formed HTTP error was thrown, forward its status and message
            if (err && typeof err.statusCode === 'number') {
                res.status(err.statusCode).json({ message: err.message || 'Error' });
                return;
            }
            // Fallback to generic internal error
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: `${HttpResponse.INTERNAL_SERVER_ERROR} \n ${HttpResponse.LOGIN_FAILED}`
            });
            return;
        };

    }


    async signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userEmail = await this._authService.signUp(req.body);
            console.log('temporary user email in authController.signUp:', userEmail);

            res.status(HttpStatus.OK).json({
                message: `${HttpResponse.OTP_SENT} ${HttpResponse.VERIFY_ACCOUNT}`,
                email: userEmail
            });

        } catch (err: any) {
            // throw new Error(`Internal server error! \n Failed to create account`);
            // next(err);

            console.error('Error in AuthController.signUp:', err);

            // If a well-formed HTTP error was thrown, forward its status and message
            if (err && typeof err.statusCode === 'number') {
                res.status(err.statusCode).json({ message: err.message || 'Error' });
                return;
            }
            // Fallback to generic internal error
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: `${HttpResponse.INTERNAL_SERVER_ERROR} \n ${HttpResponse.USER_CREATION_FAILED}`
            });
            return;
        };

    }


    async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, otpCode } = req.body;
            console.log('email and otp in authController.verifyOtp:', req.body);

            if (!email || !otpCode) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    message: 'Email and OTP are required'
                });
                return;
            }

            const { verifiedUser, accessToken, refreshToken } = await this._authService.verifyOtp(email, otpCode);

            // Set refresh token in HTTP-Only cookie
            setRefreshTokenCookie(res, refreshToken);

            res.status(HttpStatus.CREATED).json({
                message: HttpResponse.OTP_VERIFICATION_SUCCESS + ' ' + HttpResponse.USER_CREATION_SUCCESS,
                userData : verifiedUser,  // already safe user data from services
                accessToken
            });

        } catch (err: any) {
            console.error('Error in AuthController.verifyOtp:', err);
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



    async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userEmail = await this._authService.resendOtp(req.body.email);

            res.status(HttpStatus.OK).json({
                message: HttpResponse.OTP_RESENT,
                email: userEmail
            });

        } catch (err: any) {
            console.error('Error in AuthController.resendOtp:', err);
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


    async refreshAccessToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const refreshToken = req.cookies.refreshToken;
            
            if (!refreshToken) {
                console.log('refresh token is expired or missing in cookies.');
                // Rationale: While technically "missing" from the request, the only common
                // reason for an HTTP-only cookie to be missing in this context is if 
                // the browser auto-deleted it due to expiration.
                // message: "Your session has ended. Please log in again to continue."
                throw createHttpError(HttpStatus.NOT_FOUND, `${HttpResponse.SESSION_ENDED} ${HttpResponse.LOGIN_AGAIN}`);
                return;
            }

            const newAccessToken = await this._authService.refreshAccessToken(refreshToken);

            res.status(HttpStatus.OK).json({
                message: HttpResponse.ACCESS_TOKEN_REFRESHED,
                newAccessToken: newAccessToken
            });

        } catch (err: any) {
            console.error('Error in AuthController.refreshAccessToken:', err);
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



    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {            
            const refreshToken = req.cookies.refreshToken;

            // if refresh token present, best-effort - revoke it (ignore errors)
            if (refreshToken && this._authService.revokeRefreshToken) {
                await this._authService.revokeRefreshToken(refreshToken).catch(() => {});
            }


            // Always clear the cookie, regardless of token state
            clearRefreshTokenCookie(res);
            
            // Respond logout with success
            res.status(HttpStatus.OK).json({message: HttpResponse.LOGOUT_SUCCESS});


        } catch (err: any) {
            console.error('Error in AuthController.logout:', err);
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


    

    async getAuthUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.userId;
            console.log('userId in authController.getAuthUser:', userId);


            if (!userId) {
                console.log('Missing userId in authController.getAuthUser');
                res.status(HttpStatus.UNAUTHORIZED).json({message: HttpResponse.INVALID_USER_ID });
                // res.status(HttpStatus.UNAUTHORIZED).json({message: HttpResponse.TOKEN_MISSING });
                return;
            }

            const userData = await this._authService.getAuthUser(userId);

            res.status(HttpStatus.OK).json({
                // message: HttpResponse.AUTH_USER_FETCHED,
                user: userData
            });
            
        } catch (err: any) {
            console.error('Error in AuthController.getAuthUser:', err);
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




    // async editProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    //     try {
    //         const userData = await this._userServices.updateProfile(req.body);
            
    //         res.status(HttpStatus.OK).json({message: HttpResponse.PROFILE_PICTURE_CHANGED});


    //     } catch (err: any) {
    //         console.error('Error in AuthController.logout:', err);
    //         if (err && typeof err.statusCode === 'number') {
    //             res.status(err.statusCode).json({ message: err.message || 'Error' });
    //             return;
    //         }
    //         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    //             message: HttpResponse.INTERNAL_SERVER_ERROR
    //         });
    //         return;
    //     }
    // }




}
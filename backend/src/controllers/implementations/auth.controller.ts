// src/controllers/implementations/auth.controller.ts

import {Request, Response, NextFunction} from "express";
import { IAuthService } from "../../services/interfaces/IAuthServices";
import {IAuthController} from "../interfaces/IAuthController";
import { HttpStatus } from "../../constants/statusCodes";
import { HttpResponse } from "../../constants/responseMessages";
import { createHttpError } from "../../utils/httpError.utils";
import { clearRefreshTokenCookie, setRefreshTokenCookie } from "../../utils/refreshCookie.utils";
import { 
    AuthResponseDto, 
    AuthUserResponseDto, 
    ResetPasswordDto, 
    SignInRequestDto 
} from "../../dtos/auth.dto";





export class AuthController implements IAuthController {
    constructor(private _authService: IAuthService) {
    }

    
    async signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('email and password in authController.signIn:', req.body);
            const signInDto: SignInRequestDto = req.body;

            const { safeUser, accessToken, refreshToken } = await this._authService.signIn(signInDto);
            // console.log('user in authController.signIn:', safeUser);

            setRefreshTokenCookie(res, refreshToken);

            const authResponse: AuthResponseDto = {
                authUser: safeUser,
                accessToken: accessToken,
                message: `${HttpResponse.LOGIN_SUCCESS}`,
            };

            res.status(HttpStatus.OK).json(authResponse);


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


    async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void>{
        try {
            const email: string = req.body.email;
            console.log('email in authController.requestPasswordReset:', email);
            const userEmail: string = await this._authService.requestPasswordReset(email);

            res.status(HttpStatus.OK).json({
                // even if the email is not registered, respond with success to avoid email enumeration
                message: HttpResponse.PASSWORD_RESET_EMAIL_SENT,
                email: userEmail
            });

        } catch (err: any) {
            console.error('Error in AuthController.requestPasswordReset:', err);
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


    async validateResetLink(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const token: string = req.params.token;
            console.log('token in authController.validateResetLink:', token);

            const isValid: boolean = await this._authService.validateResetLink(token);

            res.status(HttpStatus.OK).json({
                isValid
            });

        } catch (err: any) {
            console.error('Error in AuthController.validateResetLink:', err);
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


    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { token, newPassword } = req.body;
            const resetPasswordDto: ResetPasswordDto = req.body;
            
            console.log('token and newPassword in authController.resetPassword:', req.body);
            await this._authService.resetPassword(resetPasswordDto);

            res.status(HttpStatus.OK).json({
                message: HttpResponse.PASSWORD_RESET_SUCCESS,
            });

        } catch (err: any) {
            console.error('Error in AuthController.resetPassword:', err);
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

            const { safeUser, accessToken, refreshToken } = await this._authService.verifyOtp(email, otpCode);

            setRefreshTokenCookie(res, refreshToken);

            const authResponse: AuthResponseDto = {
                authUser: safeUser,
                accessToken: accessToken,
                message: HttpResponse.OTP_VERIFICATION_SUCCESS + ' ' + HttpResponse.USER_CREATION_SUCCESS,
            };

            res.status(HttpStatus.CREATED).json(authResponse);

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
                // throw createHttpError(HttpStatus.NOT_FOUND, `${HttpResponse.SESSION_ENDED} ${HttpResponse.LOGIN_AGAIN}`);
                throw createHttpError(HttpStatus.UNAUTHORIZED, `${HttpResponse.SESSION_ENDED} ${HttpResponse.LOGIN_AGAIN}`);
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
            const userId = req.user?.userId;
            console.log('userId in authController.getAuthUser:', userId);


            if (!userId) {
                console.log('Missing userId in authController.getAuthUser');
                res.status(HttpStatus.UNAUTHORIZED).json({message: HttpResponse.INVALID_USER_ID });
                // res.status(HttpStatus.UNAUTHORIZED).json({message: HttpResponse.TOKEN_MISSING });
                return;
            }

            const userData: AuthUserResponseDto = await this._authService.getAuthUser(userId);

            res.status(HttpStatus.OK).json({
                // message: HttpResponse.AUTH_USER_FETCHED,
                authUser: userData
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
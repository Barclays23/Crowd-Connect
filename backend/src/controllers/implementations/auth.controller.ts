// src/controllers/implementations/auth.controller.ts

import {Request, Response, NextFunction} from "express";
import {IAuthController} from "../interfaces/IAuthController";
import { createHttpError } from "@/utils/httpError.utils";
import { clearRefreshTokenCookie, setRefreshTokenCookie } from "@/utils/refreshCookie.utils";
import { 
    AuthResponseDto, 
    AuthUserResponseDto, 
    ResetPasswordDto, 
    SignInRequestDto 
} from "@/dtos/auth.dto";
import { IAuthRegistrationService } from "@/services/auth-services/interfaces/IAuthRegistration";
import { IAuthSessionService } from "@/services/auth-services/interfaces/IAuthSession";
import { IAuthRecoveryService } from "@/services/auth-services/interfaces/IAuthRecovery";
import winstonLogger from "@/config/winston-logger.config";
import { IPasswordService } from "@/services/password-services/interfaces/IPasswordService";
import { AuthResult } from "@/types/auth.types";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { AUTH_MESSAGES, USER_MESSAGES } from "@/constants/messages.constants";





export class AuthController implements IAuthController {

    constructor(
        private _registrationService: IAuthRegistrationService,
        private _sessionService: IAuthSessionService,
        private _recoveryService: IAuthRecoveryService,
        private _passwordService: IPasswordService,
    ) {}

    
    async signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const signInDto: SignInRequestDto = req.body;

            const { safeUser, accessToken, refreshToken } = await this._sessionService.signIn(signInDto);
            winstonLogger.info("User signed in successfully", {
                userId: safeUser.userId,
                role: safeUser.role,
            });

            setRefreshTokenCookie(res, refreshToken);

            const authResponse: AuthResponseDto = {
                authUser: safeUser,
                accessToken: accessToken,
                message: `${AUTH_MESSAGES.LOGIN_SUCCESS}`,
            };

            res.status(HTTP_STATUS.OK).json(authResponse);


        } catch (err: unknown) {
            next(err);
        };
    }


    async signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userEmail = await this._registrationService.signUp(req.body);

            res.status(HTTP_STATUS.OK).json({
                message: `${AUTH_MESSAGES.OTP_SENT} ${AUTH_MESSAGES.VERIFY_ACCOUNT}`,
                email: userEmail
            });

        } catch (err: unknown) {
            next(err);
        };

    }


    async googleAuthCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authResult: AuthResult = req.user as unknown as AuthResult;
            
            if (!authResult) {
                throw createHttpError(HTTP_STATUS.UNAUTHORIZED, "Google authentication failed");
            }

            setRefreshTokenCookie(res, authResult.refreshToken);

            const frontendUrl = process.env.FRONTEND_URL as string;
            console.log('googleAuthCallback frontendUrl for redirecting :', frontendUrl);
            
            // Redirect to frontend with access token
            res.redirect(`${frontendUrl}/auth/success?token=${authResult.accessToken}`);

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown Error';
            console.error('Error in AuthController.googleAuthCallback:', msg);
            
            const frontendUrl = process.env.FRONTEND_URL as string;
            res.redirect(`${frontendUrl}/login?error=GoogleAuthFailed`);
        }
    }


    async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void>{
        try {
            const email: string = req.body.email;
            const userEmail: string = await this._recoveryService.requestPasswordReset(email);

            res.status(HTTP_STATUS.OK).json({
                // even if the email is not registered, respond with success to avoid email enumeration
                message: AUTH_MESSAGES.PASSWORD_RESET_EMAIL_SENT,
                email: userEmail
            });

        } catch (err: unknown) {
            next(err);
        };
    }


    async validateResetLink(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const token = req.params.token as string;

            const isValid: boolean = await this._recoveryService.validateResetLink(token);

            res.status(HTTP_STATUS.OK).json({
                isValid
            });

        } catch (err: unknown) {
            next(err);
        };
    }


    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { token, newPassword }: ResetPasswordDto = req.body;
            
            await this._passwordService.resetPassword({ token, newPassword });

            res.status(HTTP_STATUS.OK).json({
                message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
            });

        } catch (err: unknown) {
            next(err);
        };
    }


    async requestAuthenticateEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw createHttpError(HTTP_STATUS.UNAUTHORIZED, "User not authenticated");
            }
            
            const currentUserEmail: string  = req.user.email;
            const requestedEmail: string    = req.body.email;

            const userEmail: string = await this._recoveryService.requestAuthenticateEmail({currentUserEmail, requestedEmail});

            res.status(HTTP_STATUS.OK).json({
                success: true,
                requiresVerification: true,
                message: AUTH_MESSAGES.EMAIL_VERIFICATION_SENT,
                email: userEmail
            });

        } catch (err: unknown) {
            next(err);
        };
    }


    async updateVerifiedEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw createHttpError(HTTP_STATUS.UNAUTHORIZED, "User not authenticated");
            }
            
            const currentUserEmail: string  = req.user.email;
            const requestedEmail: string    = req.body.email;

            const otpCode: string = req.body.otpCode;

            const userEmail: string = await this._recoveryService.updateVerifiedEmail({
                currentUserEmail,
                requestedEmail,
                otpCode
            });

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: AUTH_MESSAGES.EMAIL_VERIFIED,
                email: userEmail
            });

        } catch (err: unknown) {
            next(err);
        };
    }


    async verifyAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, otpCode } = req.body;

            if (!email || !otpCode) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    message: 'Email and OTP are required'
                });
                return;
            }

            const { safeUser, accessToken, refreshToken } = await this._registrationService.verifyAccount(email, otpCode);

            setRefreshTokenCookie(res, refreshToken);

            const authResponse: AuthResponseDto = {
                authUser: safeUser,
                accessToken: accessToken,
                message: AUTH_MESSAGES.OTP_VERIFICATION_SUCCESS + ' ' + USER_MESSAGES.USER_CREATION_SUCCESS,
            };

            res.status(HTTP_STATUS.CREATED).json(authResponse);

        } catch (err: unknown) {
            next(err);
        };
    }


    async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userEmail = await this._registrationService.resendOtp(req.body.email);

            res.status(HTTP_STATUS.OK).json({
                message: AUTH_MESSAGES.OTP_RESENT,
                email: userEmail
            });

        } catch (err: unknown) {
            next(err);
        };
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
                throw createHttpError(HTTP_STATUS.UNAUTHORIZED, `${AUTH_MESSAGES.SESSION_ENDED} ${AUTH_MESSAGES.LOGIN_AGAIN}`, "SESSION_EXPIRED");
                return;
            }

            const newAccessToken = await this._sessionService.refreshAccessToken(refreshToken);

            res.status(HTTP_STATUS.OK).json({
                message: AUTH_MESSAGES.ACCESS_TOKEN_REFRESHED,
                newAccessToken: newAccessToken
            });

        } catch (err: unknown) {
            next(err);
        };
    }



    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {            
            const refreshToken = req.cookies.refreshToken;

            if (refreshToken) {
                await this._sessionService.revokeRefreshToken(refreshToken).catch(() => {});
            }

            clearRefreshTokenCookie(res);
            
            res.status(HTTP_STATUS.OK).json({message: AUTH_MESSAGES.LOGOUT_SUCCESS});

        } catch (err: unknown) {
            next(err);
        };
    }


    
    async getAuthUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                console.log('Missing userId in authController.getAuthUser');
                res.status(HTTP_STATUS.UNAUTHORIZED).json({message: USER_MESSAGES.INVALID_USER_ID });
                // res.status(HTTP_STATUS.UNAUTHORIZED).json({message: HttpResponse.TOKEN_MISSING });
                return;
            }

            const userData: AuthUserResponseDto = await this._sessionService.getAuthUser(userId);

            res.status(HTTP_STATUS.OK).json({
                // message: HttpResponse.AUTH_USER_FETCHED,
                authUser: userData
            });
            

        } catch (err: unknown) {
            next(err);
        };
    }


}
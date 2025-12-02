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
            console.log('user in authController.signIn:', verifiedUser);

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
                res.status(HttpStatus.UNAUTHORIZED).json({ message: HttpResponse.TOKEN_MISSING });
                return;
            }

            const newAccessToken = await this._authService.refreshAccessToken(refreshToken);

            res.status(HttpStatus.OK).json({
                message: HttpResponse.ACCESS_TOKEN_REFRESHED,
                accessToken: newAccessToken
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

            if (!refreshToken) {
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.TOKEN_MISSING);
            }

            const decoded = verifyRefreshToken(refreshToken);

            // Validate required fields (jti, exp, userId)
            if (!decoded || !decoded.jti || !decoded.userId || typeof decoded.exp !== 'number') {
                // Throw a specific error if the payload is malformed
                throw createHttpError(HttpStatus.BAD_REQUEST, "Malformed token payload.");
            }
            
            // Always clear the cookie, regardless of token state
            clearRefreshTokenCookie(res);


            // If token is already expired, just succeed.
            const timeToLive = decoded.exp - Math.floor(Date.now() / 1000); // Remaining seconds
            if (timeToLive <= 0) {
                res.status(HttpStatus.OK).json({ message: HttpResponse.LOGOUT_SUCCESS });
                return;
            }
            
            // Save the JTI to the blacklist/Redis
            // 3. Save the JTI to the blacklist/Redis with the calculated remaining TTL (in seconds)
            await redisClient.set(decoded.jti, 'revoked', { EX: timeToLive });

            console.log(`User with ID ${decoded.userId} logged out. JTI: ${decoded.jti} blacklisted.`);
            
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



}
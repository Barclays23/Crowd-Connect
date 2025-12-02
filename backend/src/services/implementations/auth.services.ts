// src/services/implementations/auth.services.ts

import User, { IUserModel } from "../../models/implementations/user.model";
import { IUserRepository } from "../../repositories/interfaces/IUserRepository";
import { IAuthService } from "../interfaces/IAuthServices";
import { HttpStatus } from "../../constants/statusCodes";
import { HttpResponse } from "../../constants/responseMessages";
import { createHttpError } from "../../utils/httpError.utils";
import { generateOTP } from "../../utils/generateOTP.utils";
import { sendEmail } from "../../utils/sendEmail.utils";
import { renderTemplate } from "../../utils/templateLoader2";
import { IUser } from "@shared/types";
import { redisClient } from '../../config/redis.config';
import { comparePassword, hashPassword } from "../../utils/bcrypt.utils";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../../utils/jwt.utils";
import { AuthResponseDto, SignUpRequestDto, UserDto } from "../../dtos/auth.dto";




export class AuthServices implements IAuthService {
    constructor(private readonly _userRepository: IUserRepository) {}


    async signIn(email: string, password: string): Promise<AuthResponseDto> {
        try {
            const userData = await this._userRepository.findUserByEmail(email) as IUser | null;

            console.log('userData is DB:', userData);
            
           
            if (!userData) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND)

            const isMatch: boolean = await comparePassword(password, userData.password);

            if (!isMatch) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.PASSWORD_INCORRECT);
            
            // Now create tokens
            const tokenPayload = { userId: userData._id.toString() }; // keep payload minimal
            const accessToken = createAccessToken(tokenPayload);
            const refreshToken = createRefreshToken(tokenPayload);

            const safeUser: UserDto = {
                userId: userData._id.toString(),
                name: userData.name,
                email: userData.email,
                role: userData.role,
                mobile: userData?.mobile
            };

            return {
                verifiedUser: safeUser, 
                accessToken, 
                refreshToken
            };

        } catch (error) {
            console.error("Error in AuthServices.signIn:", error);
            throw error;
        }
    }



    async signUp(user: SignUpRequestDto): Promise<string> {
        try {
            const userData = await this._userRepository.findUserByEmail(user.email) as IUser | null;
            if (userData) throw createHttpError(HttpStatus.CONFLICT, HttpResponse.EMAIL_EXIST)

            // generate OTP
            const { otpNumber, expiryDate, expiryMinutes } = generateOTP();
            console.log('Generated OTP:', otpNumber);

            // --- Dynamic HTML Template Loading ---
            const templateData = { 
                // Keys here must match the placeholders in your HTML file (e.g., {{USER_NAME}}, {{OTP_CODE}}), {{EXPIRY_MINUTES}}
                USER_NAME: user.name,
                OTP_CODE: otpNumber,
                EXPIRY_MINUTES: expiryMinutes 
            };
            const htmlTemplate = await renderTemplate("otpEmail.html", templateData);

            const mailSubject = "Your OTP Verification Code";
            const text = `TEXT..... Your verification code is: ${otpNumber}. It is valid for ${expiryMinutes} minutes.`;

            await sendEmail({ toAddress: user.email, mailSubject, text, htmlTemplate });

            const hashedPassword = await hashPassword(user.password);

            // Prepare data to store in Redis
            const redisData = {
                name: user.name,
                email: user.email,
                password: hashedPassword,
                otp: otpNumber,
                otpExpiry: expiryDate.getTime(), // Store expiryDate as a Unix timestamp (milliseconds)
            };

            const REDIS_DATA_TTL_SECONDS = 30 * 60; // 30 minutes in seconds

            // store temp data in redis for expiryMinutes minutes
            const response = await redisClient.setEx(
                user.email,  // key
                REDIS_DATA_TTL_SECONDS,  // TTL expiry in seconds
                JSON.stringify(redisData)  // values
            );

            const RedisRegisterData = await redisClient.get(user.email);
            if (RedisRegisterData) {
                const parsedData = JSON.parse(RedisRegisterData);
                console.log("Redis Data For Registration:", parsedData);
            }


            if (!response) {
                throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, HttpResponse.INTERNAL_SERVER_ERROR);
            }

            // return user email for verification step (/verify-account)
            return user.email

        } catch (error) {
            console.error("Error in AuthServices.signUp:", error);
            throw error;
        }
    }



    async verifyOtp(email: string, otp: string): Promise<AuthResponseDto> {
        try {
            // Retrieve temp data (user & otp) from Redis
            const raw = await redisClient.get(email);
            if (!raw) {
                throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.SESSION_EXPIRED);
            }

            const tempRedisData = JSON.parse(raw);
            console.log('✅✅✅ Retrieved user & OTP data from Redis:', tempRedisData);

            // Check if OTP is expired
            if (Date.now() > tempRedisData.otpExpiry) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.OTP_EXPIRED);
            }

            // Validate OTP
            if (tempRedisData.otp !== otp) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.OTP_INCORRECT);
            }

            let userData: any;
            // Check if user already exists in DB, if not, create new user (only used for registration flow)
            userData = await this._userRepository.findUserByEmail(email);
            if (!userData) {
                console.log('✅✅✅ No existing user found in DB. Proceeding to create new user.');

                // Create user account in DB
                const userDoc = new User({
                    name: tempRedisData.name,
                    email: tempRedisData.email,
                    password: tempRedisData.password,  // already a hashed password
                    role: tempRedisData.role,
                    isEmailVerified: true // Mark email as verified upon OTP verification
                });
                userData = await this._userRepository.createUser(userDoc);
            }


            // Delete temp data from Redis
            await redisClient.del(email);
            console.log('✅ Deleted temp data from Redis for email:', email);

            // Now create tokens
            const tokenPayload = { userId: userData._id.toString() }; // keep payload minimal
            const accessToken = createAccessToken(tokenPayload);
            const refreshToken = createRefreshToken(tokenPayload);

            const safeUser: UserDto = {
                userId: userData._id.toString(),
                name: userData.name,
                email: userData.email,
                role: userData.role,
                mobile: userData?.mobile
            };

            return {
                verifiedUser: safeUser, 
                accessToken, 
                refreshToken
            };


        } catch (error) {
            console.error("Error in AuthServices.verifyOtp:", error);
            throw error;
        }
    }



    async resendOtp(email: string): Promise<string> {
        try {
            // Retrieve temp data from Redis.
            const raw = await redisClient.get(email);
            if (!raw) {
                throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.SESSION_EXPIRED);
            }
            const tempRedisData = JSON.parse(raw);
            console.log('✅ Retrieved user data for resending OTP:', tempRedisData);
    

            // generate new OTP
            const { otpNumber, expiryDate, expiryMinutes } = generateOTP();
            console.log('Generated OTP (Resent):', otpNumber);

            // --- Dynamic HTML Template Loading ---
            const templateData = { 
                // Keys here must match the placeholders in your HTML file (e.g., {{USER_NAME}}, {{OTP_CODE}}), {{EXPIRY_MINUTES}}
                USER_NAME: tempRedisData.name,
                OTP_CODE: otpNumber,
                EXPIRY_MINUTES: expiryMinutes 
            };
            const htmlTemplate = await renderTemplate("otpEmail.html", templateData);
            const mailSubject = "Your OTP Verification Code - Resent";
            const text = `TEXT..... Your verification code is: ${otpNumber}. It is valid for ${expiryMinutes} minutes.`;
            await sendEmail({ toAddress: email, mailSubject, text, htmlTemplate });


            // Prepare updated data for Redis
            const updatedRedisData = {
                ...tempRedisData, // Maintain original user details
                otp: otpNumber,  // New OTP
                otpExpiry: expiryDate.getTime(), // NEW otp expiry timestamp
            };

            // Update OTP and expiry in Redis (Redis TTL will remain the same as when requested first otp)
            const response = await redisClient.set(email, JSON.stringify(updatedRedisData));
            if (!response) {
                throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, HttpResponse.INTERNAL_SERVER_ERROR);
            }

            return email;

        } catch (error) {
            console.error("Error in AuthServices.resendOtp:", error);
            throw error;
        }
    }



    async refreshAccessToken(refreshToken: string): Promise<string> {
        try {
            console.log('refreshToken received in AuthServices.refreshAccessToken:', refreshToken);

            if (!refreshToken) {
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.TOKEN_MISSING);
            }
            
            // Verify refresh token and extract payload
            const decoded = verifyRefreshToken(refreshToken);

            if (!decoded || !decoded.userId || !decoded.jti) {
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.TOKEN_INVALID_OR_EXPIRED);
            }

            // ⚠️ CRITICAL STEP: Check the blacklist (e.g., in Redis)
            // If the JTI exists in the store, it means the token was logged out/revoked.
            const isBlacklisted = await redisClient.get(decoded.jti);
            if (isBlacklisted) {
                // This token was revoked by a user logout. It is invalid.
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.TOKEN_REVOKED);
            }

            // Create new access token
            const newAccessToken = createAccessToken({ userId: decoded.userId });
            return newAccessToken;

        } catch (error) {
            console.error("Error in AuthServices.refreshAccessToken:", error);
            throw error;
        }
    }



}
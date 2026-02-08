// src/services/auth-services/implementations/authRegistration.service.ts

import { AuthUserResponseDto, SignUpRequestDto } from "@/dtos/auth.dto";
import { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import { IAuthRegistrationService } from "../interfaces/IAuthRegistration";
import { SignUpUserInput, UserEntity } from "@/entities/user.entity";
import { createHttpError } from "@/utils/httpError.utils";
import { HttpStatus } from "@/constants/statusCodes.constants";
import { HttpResponse } from "@/constants/responseMessages.constants";
import { generateOTP } from "@/utils/generateOTP.utils";
import { renderTemplate } from "@/utils/templateLoader2";
import { sendEmail } from "@/utils/email.utils";
import { hashPassword } from "@/utils/bcrypt.utils";
import { REDIS_DATA_TTL_SECONDS, redisClient } from "@/config/redis.config";
import { AuthResult } from "@/types/auth.types";
import { mapSignUpRequestDtoToInput } from "@/mappers/user.mapper";
import { createAccessToken, createRefreshToken } from "@/utils/jwt.utils";





export class AuthRegistrationService implements IAuthRegistrationService {
    constructor(private readonly _userRepository: IUserRepository) {}

    async signUp(signUpDto: SignUpRequestDto): Promise<string> {
        try {
            const existUser: UserEntity | null = await this._userRepository.getUserByEmail(signUpDto.email);
            if (existUser) throw createHttpError(HttpStatus.CONFLICT, HttpResponse.EMAIL_EXIST)
            
            const { otpNumber, expiryDate, expiryMinutes } = generateOTP();
            console.log('Generated OTP:', otpNumber);

            const templateData = { 
                // Keys here must match the placeholders in your HTML file (e.g., {{USER_NAME}}, {{OTP_CODE}}), {{EXPIRY_MINUTES}}
                USER_NAME: signUpDto.name,
                OTP_CODE: otpNumber,
                EXPIRY_MINUTES: expiryMinutes 
            };
            const htmlTemplate = await renderTemplate("otpEmail.html", templateData);

            const mailSubject = "Your OTP Verification Code";
            const text = `TEXT..... Your verification code is: ${otpNumber}. It is valid for ${expiryMinutes} minutes.`;

            await sendEmail({ toAddress: signUpDto.email, mailSubject, text, htmlTemplate });

            const hashedPassword = await hashPassword(signUpDto.password);

            // Prepare data to store in Redis
            const redisData = {
                name: signUpDto.name,
                email: signUpDto.email,
                password: hashedPassword,
                otp: otpNumber,
                otpExpiry: expiryDate.getTime(),
            };

            // store temp data in redis for expiryMinutes minutes
            const response = await redisClient.setEx(
                signUpDto.email,
                REDIS_DATA_TTL_SECONDS,
                JSON.stringify(redisData)
            );

            
            if (!response) {
                throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, HttpResponse.INTERNAL_SERVER_ERROR);
            }

            // return user email for otp verification step (/verify-account)
            return signUpDto.email;

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in AuthRegistrationService.signUp:", msg);
            throw error;
        }
    }


    async verifyAccount(email: string, otp: string): Promise<AuthResult> {
        try {
            const raw = await redisClient.get(email);
            if (!raw) {
                throw createHttpError(HttpStatus.NOT_FOUND, `${HttpResponse.SESSION_EXPIRED} ${HttpResponse.TRY_AGAIN}`);
            }

            const tempRedisData = JSON.parse(raw);
            console.log('✅✅✅ Retrieved user & OTP data from Redis:', tempRedisData);

            if (Date.now() > tempRedisData.otpExpiry) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.OTP_EXPIRED);
            }

            if (tempRedisData.otp !== otp) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.OTP_INCORRECT);
            }

            
            let userData: UserEntity | null = await this._userRepository.getUserByEmail(email);
            
            if (!userData) {
                // dto from redis data
                const dto: SignUpRequestDto = {
                    name: tempRedisData.name,
                    email: tempRedisData.email,
                    password: tempRedisData.password,
                };

                const signUpEntity: SignUpUserInput = mapSignUpRequestDtoToInput(dto);
                userData = await this._userRepository.createUser(signUpEntity);
            }

            // Delete temp data from Redis
            await redisClient.del(email);

            const tokenPayload = { userId: userData.id.toString() }; // keep payload minimal
            const accessToken = createAccessToken(tokenPayload);
            const refreshToken = createRefreshToken(tokenPayload);


            const safeUser: AuthUserResponseDto = {
                userId: userData.id.toString(),
                name: userData.name,
                email: userData.email,
                role: userData.role,
                // mobile: userData?.mobile,
                status: userData.status,
                isEmailVerified: userData.isEmailVerified,
                isSuperAdmin: userData.isSuperAdmin
            };

            return {
                safeUser, 
                accessToken, 
                refreshToken
            };


        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in AuthRegistrationService.verifyAccount:", msg);
            throw error;
        }
    }


    async resendOtp(email: string): Promise<string> {
        try {
            const raw = await redisClient.get(email);
            if (!raw) {
                throw createHttpError(HttpStatus.NOT_FOUND, `${HttpResponse.SESSION_EXPIRED} ${HttpResponse.TRY_AGAIN}`);
            }
            const tempRedisData = JSON.parse(raw);
            console.log('✅ Retrieved user data for resending OTP:', tempRedisData);
    

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

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in AuthRegistrationService.resendOtp:", msg);
            throw error;
        }
    }

}
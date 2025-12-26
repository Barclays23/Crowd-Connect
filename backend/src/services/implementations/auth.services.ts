// src/services/implementations/auth.services.ts

import { IUserRepository } from "../../repositories/interfaces/IUserRepository";
import { IAuthService } from "../interfaces/IAuthServices";
import { HttpStatus } from "../../constants/statusCodes";
import { HttpResponse } from "../../constants/responseMessages";
import { createHttpError } from "../../utils/httpError.utils";
import { generateOTP } from "../../utils/generateOTP.utils";
import { sendEmail } from "../../utils/sendEmail.utils";
import { renderTemplate } from "../../utils/templateLoader2";
import { REDIS_DATA_TTL_SECONDS, REDIS_TOKEN_PREFIX, redisClient } from '../../config/redis.config';
import { comparePassword, hashPassword } from "../../utils/bcrypt.utils";

import { 
    createAccessToken, 
    createRefreshToken,
    verifyRefreshToken 
} from "../../utils/jwt.utils";

import { 
    SignUpRequestDto, 
    AuthUserDto, 
    SignInRequestDto,
    ResetPasswordDto,  
} from "../../dtos/auth.dto";

import { 
    SignUpUserEntity, 
    UserEntity, 
    SensitiveUserEntity 
} from "../../entities/user.entity";

import { mapSignUpDtoToSignUpUserEntity, mapUserEntityToAuthUserDto } from "../../mappers/user.mapper";
import { AuthResult } from "../../types/auth.types";
import { generateCryptoToken } from "../../utils/crypto.utils";





export class AuthServices implements IAuthService {
    constructor(private readonly _userRepository: IUserRepository) {}


    async signIn(signInDto: SignInRequestDto): Promise<AuthResult> {
        try {
            const userData: SensitiveUserEntity | null = await this._userRepository.findAuthUser({email: signInDto.email});

            if (!userData) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

            const isMatch: boolean = await comparePassword(signInDto.password, userData.password);
            if (!isMatch) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.PASSWORD_INCORRECT);
            

            const tokenPayload = { userId: userData.id.toString() }; // keep payload minimal
            const accessToken = createAccessToken(tokenPayload);
            const refreshToken = createRefreshToken(tokenPayload);

            const safeUser: AuthUserDto = mapUserEntityToAuthUserDto(userData);

            return {
                safeUser, 
                accessToken, 
                refreshToken
            };

        } catch (error) {
            console.error("Error in AuthServices.signIn:", error);
            throw error;
        }
    }



    async signUp(signUpDto: SignUpRequestDto): Promise<string> {
        try {
            const existUser: UserEntity | null = await this._userRepository.findUserByEmail(signUpDto.email);
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

            // better to return object for future scalability
            // return { email: signUpDto.email };

        } catch (error) {
            console.error("Error in AuthServices.signUp:", error);
            throw error;
        }
    }


    async requestPasswordReset(email: string): Promise<string>{
        try {
            const existingUser: UserEntity | null = await this._userRepository.findUserByEmail(email);
            
            if (!existingUser){
                console.log('no user found in this email for password reset request.');
                // For security reasons, don't reveal whether the email exists
                // throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
            } else {
                const { cryptoToken, expiryDate, expiryMinutes } = generateCryptoToken();
                // console.log('cryptoToken:', cryptoToken);
                // console.log('Expiry:', expiryDate.toISOString());
                // console.log('Valid for:', expiryMinutes, 'minutes');
                
                const baseUrl = process.env.FRONTEND_URL;
                const resetLink = `${baseUrl}/reset-password?token=${cryptoToken}&email=${encodeURIComponent(email)}`;
                
                // email template data
                const templateData = {
                    USER_NAME: existingUser?.name || 'User',
                    RESET_LINK: resetLink,
                    EXPIRY_MINUTES: expiryMinutes
                };
                
                const htmlTemplate = await renderTemplate('resetPassword.html', templateData);
                const mailSubject = 'Reset Your Crowd Connect Password';
                const text = `Reset your password here: ${resetLink}\nThis link expires in ${expiryMinutes} minutes.`;
                
                await sendEmail({
                    toAddress: email,
                    mailSubject,
                    text,
                    htmlTemplate,
                });
                
                const redisKey = `${REDIS_TOKEN_PREFIX}${cryptoToken}`;
                const redisData = {
                    email,
                    createdAt: Date.now(),
                };
                
                await redisClient.setEx(
                    redisKey,
                    expiryMinutes * 60, // expiry in seconds
                    JSON.stringify(redisData)
                );
            }
            
            return email;

        } catch (error) {
            console.error("Error in AuthServices.requestPasswordReset:", error);
            throw error;
        }
    }


    async validateResetLink(token: string): Promise<boolean> {
        const redisKey = `${REDIS_TOKEN_PREFIX}${token}`;
        const exists = await redisClient.get(redisKey);

        if (!exists) {
            throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.RESET_LINK_INVALID_OR_EXPIRED);
        }

        return true;
    }




    async resetPassword({ token, newPassword }: ResetPasswordDto): Promise<string> {
        try {
            const redisKey = `${REDIS_TOKEN_PREFIX}${token}`;
            const raw = await redisClient.get(redisKey);
            if (!raw) {
                throw createHttpError(HttpStatus.NOT_FOUND, `${HttpResponse.RESET_LINK_INVALID_OR_EXPIRED}`);
            }
            const tokenData = JSON.parse(raw);

            const hashedPassword = await hashPassword(newPassword);

            const updatedUser: UserEntity | null = await this._userRepository.updateUserPassword(tokenData.email, hashedPassword);

            if (!updatedUser) {
                throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_ACCOUNT_NOT_EXIST);
            }

            await redisClient.del(redisKey);

            return updatedUser.email;

        } catch (error) {
            console.error("Error in AuthServices.resetPassword:", error);
            throw error;
        }
    }
        
        
        
    async verifyOtp(email: string, otp: string): Promise<AuthResult> {
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

            
            let userData: UserEntity | null = await this._userRepository.findUserByEmail(email);
            
            if (!userData) {
                // dto from redis data
                const dto: SignUpRequestDto = {
                    name: tempRedisData.name,
                    email: tempRedisData.email,
                    password: tempRedisData.password
                };

                const signUpEntity: SignUpUserEntity = mapSignUpDtoToSignUpUserEntity(dto);
                userData = await this._userRepository.createUser(signUpEntity);
            }

            // Delete temp data from Redis
            await redisClient.del(email);

            const tokenPayload = { userId: userData.id.toString() }; // keep payload minimal
            const accessToken = createAccessToken(tokenPayload);
            const refreshToken = createRefreshToken(tokenPayload);



            const safeUser: AuthUserDto = {
                userId: userData.id.toString(),
                name: userData.name,
                email: userData.email,
                role: userData.role,
                // mobile: userData?.mobile,
                status: userData.status,
                isEmailVerified: userData.isEmailVerified
            };

            return {
                safeUser, 
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

        } catch (error) {
            console.error("Error in AuthServices.resendOtp:", error);
            throw error;
        }
    }



    async refreshAccessToken(refreshToken: string): Promise<string> {
        try {
            // console.log('refreshToken received in AuthServices.refreshAccessToken:', refreshToken);

            if (!refreshToken) {
                console.log('refresh token is expired or missing in parameter.');
                // message: "Your session has ended. Please log in again to continue."
                throw createHttpError(HttpStatus.UNAUTHORIZED, `${HttpResponse.SESSION_ENDED} ${HttpResponse.LOGIN_AGAIN}`);
            }
            
            const decoded = verifyRefreshToken(refreshToken);
            // console.log('Decoded refreshToken AuthServices.refreshAccessToken:', decoded);

            if (!decoded || !decoded.userId || !decoded.jti) {
                console.error('Decoded refreshToken expired or is missing required fields:', decoded);
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.TOKEN_INVALID_OR_EXPIRED);
            }

            // Check the blacklist. If the JTI exists in the store, it means the token was logged out/revoked.
            const isBlacklisted = await redisClient.get(decoded.jti);
            if (isBlacklisted) {
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.TOKEN_REVOKED);
            }

            // Create new access token
            const tokenPayload = { userId: decoded.userId.toString() }; // keep payload minimal
            const newAccessToken: string = createAccessToken(tokenPayload);
            // you can create new refreshToken if wanted to rotate refresh tokens & set it cookies
            // const newRefreshToken = createRefreshToken({ userId: decoded.userId });

            console.log('✅ new accessToken generated');
            return newAccessToken;

            // better to return object for future scalability
            // return {
            //     newAccessToken
            // };


        } catch (error) {
            console.error("Error in AuthServices.refreshAccessToken:", error);
            throw error;
        }
    }




    async revokeRefreshToken(refreshToken: string): Promise<void> {
        try {
            const decoded = verifyRefreshToken(refreshToken);

            if (!decoded || !decoded.jti) {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Malformed token payload.");
            }

            // Save the JTI to the blacklist/Redis with remaining TTL (in seconds)
            if (typeof decoded.exp === "number") {
                const timeToLive = decoded.exp - Math.floor(Date.now() / 1000);
                if (timeToLive > 0) {
                    await redisClient.set(decoded.jti, 'revoked', { EX: timeToLive });
                    console.log(`User with ID ${decoded.userId} logged out. JTI: ${decoded.jti} blacklisted.`);
                }
            } else {
                throw createHttpError(HttpStatus.BAD_REQUEST, "Malformed token payload: missing expiration.");
            }


        } catch (error) {
            console.error("Error in AuthServices.revokeRefreshToken:", error);
            throw error;
        }
    }




    async getAuthUser(userId: string): Promise<AuthUserDto> {
        try {
            const userData: UserEntity | null = await this._userRepository.findUserById(userId);

            if (!userData) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

            const safeUser: AuthUserDto = {
                userId: userData.id.toString(),
                name: userData.name,
                email: userData.email,
                role: userData.role,
                // mobile: userData?.mobile,
                status: userData.status,
                isEmailVerified: userData.isEmailVerified
            };

            return safeUser;

        } catch (error) {
            console.error("Error in AuthServices.getAuthUser:", error);
            throw error;
        }
    }





}
// src/services/auth-services/implementations/authRecovery.service.ts
import { UserEntity } from "@/entities/user.entity";
import { IAuthRecoveryService } from "../interfaces/IAuthRecovery";
import { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import { generateCryptoToken } from "@/utils/crypto.utils";
import { normalizeEmail } from "@/utils/email.utils";
import { REDIS_TOKEN_PREFIX } from "@/config/redis-cache.config";
import { createHttpError } from "@/utils/httpError.utils";
import { HttpStatus } from "@/constants/statusCodes.constants";
import { HttpResponse } from "@/constants/responseMessages.constants";
import { UpdateEmailDto } from "@/dtos/auth.dto";
import { generateOTP } from "@/utils/generateOTP.utils";
import { ICacheService } from "@/services/cache-services/interfaces/ICacheService";
import { renderTemplateWithHandleBars } from "@/utils/templateLoader1";
import { EmailTemplate, PasswordResetPayload, VerifyEmailPayload } from "@/types/email.types";
import { IMailService } from "@/services/mail-services/interfaces/IMailService";





export class AuthRecoveryService implements IAuthRecoveryService {
    constructor(
        private readonly _userRepository: IUserRepository,
        private readonly _cacheService  : ICacheService,
        private readonly _mailService   : IMailService
    ) {}


    
    async requestPasswordReset(email: string): Promise<string>{
        try {
            const existingUser: UserEntity | null = await this._userRepository.getUserByEmail(email);
            
            if (!existingUser){
                console.log('no user found in this email for password reset request.');
                // For security reasons, don't reveal whether the email exists
                // throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
            } else {
                const { cryptoToken, expiryDate, expiryMinutes } = generateCryptoToken();
                
                const baseUrl   = process.env.FRONTEND_URL;
                const resetLink = `${baseUrl}/reset-password?token=${cryptoToken}&email=${encodeURIComponent(email)}`;
                
                const templatePayload: PasswordResetPayload = {
                    USER_NAME       : existingUser?.name || 'User',
                    RESET_LINK      : resetLink,
                    EXPIRY_MINUTES  : expiryMinutes
                };
                
                // const htmlTemplate = await renderTemplate('passwordReset.html', templatePayload);
                const htmlTemplate = await renderTemplateWithHandleBars(EmailTemplate.PASSWORD_RESET, templatePayload);
                const mailSubject = 'Reset Your Crowd Connect Password';
                const text = `Reset your password here: ${resetLink}\nThis link expires in ${expiryMinutes} minutes.`;

                await this._mailService.sendEmailToUser({
                    toAddress: email,
                    mailSubject,
                    text,
                    htmlTemplate,
                })
                
                const redisKey  = `${REDIS_TOKEN_PREFIX}${cryptoToken}`;
                const redisData = {
                    email,
                    createdAt: Date.now(),
                };
                
                await this._cacheService.setKeyValue(redisKey, JSON.stringify(redisData), expiryMinutes * 60);
            }
            
            return email;

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in AuthRecoveryService.requestPasswordReset:", msg);
            throw error;
        }
    }


    async validateResetLink(token: string): Promise<boolean> {
        const redisKey = `${REDIS_TOKEN_PREFIX}${token}`;
        const exists = await this._cacheService.getKeyValue(redisKey);

        if (!exists) {
            throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.RESET_LINK_INVALID_OR_EXPIRED);
        }

        return true;
    }


    // also used for changing email & verifying email if not already verified
    async requestAuthenticateEmail({currentUserEmail, requestedEmail}: {
        currentUserEmail: string,
        requestedEmail: string
    }): Promise<string> {
        try {
            const normalizedCurrentEmail = normalizeEmail(currentUserEmail);
            const normalizedRequestedEmail = normalizeEmail(requestedEmail);

            const currentUser: UserEntity|null = await this._userRepository.getUserByEmail(normalizedCurrentEmail);

            if (!currentUser) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

            if (currentUser.isEmailVerified) {
                throw createHttpError(HttpStatus.BAD_REQUEST,
                    `${HttpResponse.EMAIL_ALREADY_VERIFIED} ${HttpResponse.CANNOT_CHANGE_VERIFIED_EMAIL}
                    `);
            }
                
            const isChangingEmail: boolean = normalizedCurrentEmail !== normalizedRequestedEmail;

            if (isChangingEmail) {
                const existingEmailUser: UserEntity|null = await this._userRepository.getUserByEmail(normalizedRequestedEmail);

                if (existingEmailUser && existingEmailUser.id !== currentUser.id) {
                    throw createHttpError(HttpStatus.CONFLICT, HttpResponse.EMAIL_EXIST);
                }
            }


            const { otpNumber, expiryDate, expiryMinutes } = generateOTP();
            console.log('Generated OTP (for Verify Email Request):', otpNumber);

            const redisKey = `verify-email:${currentUser.id}:${normalizedRequestedEmail}`;

            const redisData = {
                userId          : currentUser.id,
                currentEmail    : normalizedCurrentEmail,
                requestedEmail  : normalizedRequestedEmail,
                isChangingEmail : isChangingEmail,
                otp             : otpNumber,
                otpExpiry       : expiryDate.getTime(),
                createdAt       : Date.now(),
            };

            const response = await this._cacheService.setKeyValue(
                redisKey, 
                JSON.stringify(redisData), 
                expiryMinutes * 60
            );

            // --- Dynamic HTML Template Loading ---
            const templatePayload: VerifyEmailPayload = {
                USER_NAME       : currentUser?.name || 'User',
                OTP_NUMBER      : otpNumber,
                EXPIRY_MINUTES  : expiryMinutes,
                CURRENT_YEAR    : new Date().getFullYear(),
                GREETING_SUFFIX : currentUser?.name ? ` ${currentUser.name}` : '',
                EMAIL_HEADING   : isChangingEmail ? 'Verify Your New Email' : 'Verify Your Email Address',
                EMAIL_MESSAGE   : isChangingEmail
                    ? "You’re updating your email address. Please use the code below to confirm your new email."
                    : "You’re almost there! Use this code to verify your email and start connecting with amazing events and people."
            };

            // const htmlTemplate = await renderTemplate('verifyEmail.html', templatePayload);
            const htmlTemplate = await renderTemplateWithHandleBars(EmailTemplate.VERIFY_EMAIL, templatePayload);
            const mailSubject = isChangingEmail ? 'Verify Your New Email Address' : 'Verify Your Email Address';
            const text = `Your verification code is: ${otpNumber}\nThis code expires in ${expiryMinutes} minutes.`;

            await this._mailService.sendEmailToUser({
                toAddress: normalizedRequestedEmail,
                mailSubject,
                text,
                htmlTemplate,
            })

            return normalizedRequestedEmail;

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in AuthRecoveryService.requestAuthenticateEmail:", msg);
            throw error;
        }
    }


    async updateVerifiedEmail({ currentUserEmail, requestedEmail, otpCode}: {
        currentUserEmail: string;
        requestedEmail: string;
        otpCode: string;
    }): Promise<string> {
        try {
            const normalizedCurrentEmail = normalizeEmail(currentUserEmail);
            const normalizedRequestedEmail = normalizeEmail(requestedEmail);

            const currentUser: UserEntity | null = await this._userRepository.getUserByEmail(normalizedCurrentEmail);

            if (!currentUser) {
                throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
            }

            const redisKey      = `verify-email:${currentUser.id}:${normalizedRequestedEmail}`;
            const redisRawValue = await this._cacheService.getKeyValue(redisKey);

            if (!redisRawValue) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.OTP_EXPIRED);
            }

            const redisData = JSON.parse(redisRawValue);

            if (redisData.userId !== currentUser.id) {
                throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED_ACCESS);
            }

            if (Date.now() > redisData.otpExpiry) {
                await this._cacheService.deleteKeyValue(redisKey);
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.OTP_EXPIRED);
            }

            if (redisData.otp !== otpCode) {
                throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.OTP_INCORRECT);
            }


            const updateInput: UpdateEmailDto = {
                isEmailVerified: true,
            }

            const isChangingEmail = redisData.isChangingEmail === true;

            if (isChangingEmail) {
                updateInput.email = normalizedRequestedEmail
            }

            const updatedUser: UserEntity | null = await this._userRepository.updateUserEmail(currentUser.id, updateInput);

            if (!updatedUser) {
                throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
            }

            await this._cacheService.deleteKeyValue(redisKey);

            return updatedUser.email;

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error in AuthRecoveryService.updateVerifiedEmail:', msg);
            throw error;
        }
    }


}
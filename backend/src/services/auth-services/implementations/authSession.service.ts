// src/services/auth-services/implementations/authSession.service.ts

import { AuthUserResponseDto, SignInRequestDto } from "@/dtos/auth.dto";
import { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import { IAuthSessionService } from "../interfaces/IAuthSession";
import { AuthResult } from "@/types/auth.types";
import { createHttpError } from "@/utils/httpError.utils";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { USER_STATUS, UserStatus } from "@/constants/user-system.constants";
import { comparePassword } from "@/utils/bcrypt.utils";
import { mapUserEntityToAuthUserDto } from "@/mappers/user.mapper";
import { 
    createAccessToken, 
    createRefreshToken, 
    verifyRefreshToken 
} from "@/utils/jwt.utils";
import { SensitiveUserEntity, UpdateUserInput, UserEntity } from "@/entities/user.entity";
import { ICacheService } from "@/services/cache-services/interfaces/ICacheService";
import { Profile } from "passport-google-oauth20";
import { AuthProvider } from "@/types/user.types";
import { BaseUserResponseDto } from "@/dtos/user.dto";
import { AUTH_MESSAGES, USER_MESSAGES } from "@/constants/messages.constants";




export class AuthSessionService implements IAuthSessionService {
    constructor(
        private readonly _userRepository: IUserRepository,
        private readonly _cacheService: ICacheService
    ) {}

    async signIn(signInDto: SignInRequestDto): Promise<AuthResult> {
        try {
            const userData: SensitiveUserEntity | null = await this._userRepository.findAuthUser({email: signInDto.email});
            // console.log('✅ User data retrieved in AuthSessionService.signIn:', userData);
            if (!userData) throw createHttpError(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND);

            if (userData.status === USER_STATUS.BLOCKED) {
                throw createHttpError(HTTP_STATUS.FORBIDDEN, USER_MESSAGES.USER_ACCOUNT_BLOCKED);
            }

            // if user already have an account created with Google Auth, but no password
            if (!userData.password) {
                throw createHttpError(
                    HTTP_STATUS.BAD_REQUEST, 
                    "Please use Google to log into this account.", 
                    "OAUTH_USER_LOGIN"
                );
            }

            const isMatch: boolean = await comparePassword(signInDto.password, userData.password);
            if (!isMatch) throw createHttpError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.PASSWORD_INCORRECT);
            
            // change user.status to 'active' if it was 'inactive' or 'pending'
            if (userData.status === USER_STATUS.PENDING) {
                const updatedStatus: UserStatus | null = await this._userRepository.updateUserStatus(userData.userId, USER_STATUS.ACTIVE);
                // console.log(`✅ User status updated to '${updatedStatus}' upon sign-in.`);
            }

            const tokenPayload  = { userId: userData.userId.toString() }; // keep payload minimal
            const accessToken   = createAccessToken(tokenPayload);
            const refreshToken  = createRefreshToken(tokenPayload);

            const safeUser: AuthUserResponseDto = mapUserEntityToAuthUserDto(userData);

            return {
                safeUser, 
                accessToken, 
                refreshToken
            };

        } catch (error: unknown) {
            throw error;
        }
    }


    async handleGoogleAuth(googleProfile: Profile): Promise<AuthResult> {
        try {
            console.log('handleGoogleAuth googleProfile :', googleProfile)
            const email: string | undefined = googleProfile.emails?.[0].value;
            if (!email) throw createHttpError(HTTP_STATUS.BAD_REQUEST, "No email found in Google profile");
    
            let user: SensitiveUserEntity | null = await this._userRepository.getUserByEmail(email);

            if (!user) {
                // Create new user: applying the Profile Picture & User Name (Golden Rule)
                user = await this._userRepository.createGoogleAuthUser({
                    name            : googleProfile.displayName,
                    email           : email,
                    isEmailVerified : true,
                    authProvider    : AuthProvider.GOOGLE,
                    googleId        : googleProfile.id,
                    profilePic      : googleProfile.photos?.[0].value, 
                });

            } else {
                // User exists (either local or already Google)
                const updateData: Partial<UpdateUserInput> = {};
                let needsUpdate = false;

                // 1. Check if we need to link the account
                if (!user.googleId) {
                    updateData.googleId     = googleProfile.id;
                    updateData.authProvider = AuthProvider.GOOGLE;
                    needsUpdate     = true;
                }

                // 2. Smart Picture Sync
                const latestGooglePic = googleProfile.photos?.[0].value;

                if (latestGooglePic) {
                    const hasNoPic      = !user.profilePic || user.profilePic === "";
                    const isGooglePic   = user.profilePic && user.profilePic.includes("googleusercontent.com");

                    if (hasNoPic || isGooglePic) {
                        // NOT overwriting a Cloudinary/S3 pic
                        if (user.profilePic !== latestGooglePic) {
                            updateData.profilePic = latestGooglePic;
                            needsUpdate = true;
                        }
                    }
                }

                if (needsUpdate) {
                    const updatedUser = await this._userRepository.updateUserByAdmin(user.userId, updateData);
                    if (updatedUser) user = updatedUser;
                }

            }
    
            if (!user) throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to authenticate with Google");
    
            const tokenPayload  = { userId: user.userId.toString() };
            const accessToken   = createAccessToken(tokenPayload);
            const refreshToken  = createRefreshToken(tokenPayload);
    
            const safeUser: BaseUserResponseDto = mapUserEntityToAuthUserDto(user as UserEntity);
    
            return { 
                safeUser, 
                accessToken, 
                refreshToken 
            };
            
        } catch (error: unknown) {
            throw error;
        }
    }


    async refreshAccessToken(refreshToken: string): Promise<string> {
        try {
            if (!refreshToken) {
                // message: "Your session has ended. Please log in again to continue."
                throw createHttpError(HTTP_STATUS.UNAUTHORIZED, `${AUTH_MESSAGES.SESSION_ENDED} ${AUTH_MESSAGES.LOGIN_AGAIN}`, "SESSION_EXPIRED");
            }
            
            const decoded = verifyRefreshToken(refreshToken);
            // console.log('Decoded refreshToken AuthSessionService.refreshAccessToken:', decoded);

            if (!decoded || !decoded.userId || !decoded.jti) {
                console.error('Decoded refreshToken expired or is missing required fields:', decoded);
                throw createHttpError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.TOKEN_INVALID_OR_EXPIRED);
            }

            // Check the blacklist. If the JTI exists in the store, it means the token was logged out/revoked.
            const isBlacklisted: string | null = await this._cacheService.getKeyValue(decoded.jti);
            if (isBlacklisted) {
                throw createHttpError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.TOKEN_REVOKED);
            }

            // Create new access token
            const tokenPayload = { userId: decoded.userId.toString() }; // keep payload minimal
            const newAccessToken: string = createAccessToken(tokenPayload);
            // you can create new refreshToken if wanted to rotate refresh tokens & set it cookies
            // const newRefreshToken = createRefreshToken({ userId: decoded.userId });

            console.log('✅ new accessToken generated');
            return newAccessToken;

        } catch (error: unknown) {
            throw error;
        }
    }


    async revokeRefreshToken(refreshToken: string): Promise<void> {
        try {
            const decoded = verifyRefreshToken(refreshToken);

            if (!decoded || !decoded.jti) {
                throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Malformed token payload.");
            }

            // Save the JTI to the blacklist/Redis with remaining TTL (in seconds)
            if (typeof decoded.exp === "number") {
                const timeToLive = decoded.exp - Math.floor(Date.now() / 1000);
                if (timeToLive > 0) {
                    await this._cacheService.setKeyValue(decoded.jti, 'revoked', timeToLive);
                    console.log(`User with ID ${decoded.userId} logged out. JTI: ${decoded.jti} blacklisted.`);
                }
            } else {
                throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Malformed token payload: missing expiration.");
            }


        } catch (error: unknown) {
            throw error;
        }
    }


    async getAuthUser(userId: string): Promise<AuthUserResponseDto> {
        try {
            const userData: UserEntity | null = await this._userRepository.getUserById(userId);

            if (!userData) throw createHttpError(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND);

            const safeUser: AuthUserResponseDto = {
                userId: userData.userId.toString(),
                name: userData.name,
                email: userData.email,
                role: userData.role,
                mobile: userData?.mobile,
                walletBalance: userData.walletBalance || 0,
                status: userData.status,
                isEmailVerified: userData.isEmailVerified,
                isSuperAdmin: userData.isSuperAdmin
            };

            return safeUser;

        } catch (error: unknown) {
            throw error;
        }
    }


}
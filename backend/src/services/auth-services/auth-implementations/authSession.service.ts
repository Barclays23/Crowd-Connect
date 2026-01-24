// src/services/auth/implementations/authSessionService.ts

import { AuthUserResponseDto, SignInRequestDto } from "../../../dtos/auth.dto.js";
import { IUserRepository } from "../../../repositories/interfaces/IUserRepository.js";
import { IAuthSessionService } from "../auth-interfaces/IAuthSession.js";
import { AuthResult } from "../../../types/auth.types.js";
import { createHttpError } from "../../../utils/httpError.utils.js";
import { HttpStatus } from "../../../constants/statusCodes.constants.js";
import { HttpResponse } from "../../../constants/responseMessages.constants.js";
import { UserStatus } from "../../../constants/roles-and-statuses.js";
import { comparePassword } from "../../../utils/bcrypt.utils.js";
import { mapUserEntityToAuthUserDto } from "../../../mappers/user.mapper.js";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../../../utils/jwt.utils.js";
import { redisClient } from "../../../config/redis.config.js";
import { SensitiveUserEntity, UserEntity } from "../../../entities/user.entity.js";



export class AuthSessionService implements IAuthSessionService {
    constructor(private readonly _userRepository: IUserRepository) {}

    async signIn(signInDto: SignInRequestDto): Promise<AuthResult> {
        try {
            const userData: SensitiveUserEntity | null = await this._userRepository.findAuthUser({email: signInDto.email});
            // console.log('✅ User data retrieved in AuthSessionService.signIn:', userData);
            if (!userData) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

            if (userData.status === UserStatus.BLOCKED) {
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.USER_ACCOUNT_BLOCKED);
            }

            const isMatch: boolean = await comparePassword(signInDto.password, userData.password);
            if (!isMatch) throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.PASSWORD_INCORRECT);
            
            // change user.status to 'active' if it was 'inactive' or 'pending'
            if (userData.status === UserStatus.PENDING) {
                const updatedStatus: UserStatus = await this._userRepository.updateUserStatus(userData.id, UserStatus.ACTIVE);
                // console.log(`✅ User status updated to '${updatedStatus}' upon sign-in.`);
            }

            const tokenPayload = { userId: userData.id.toString() }; // keep payload minimal
            const accessToken = createAccessToken(tokenPayload);
            const refreshToken = createRefreshToken(tokenPayload);

            const safeUser: AuthUserResponseDto = mapUserEntityToAuthUserDto(userData);

            return {
                safeUser, 
                accessToken, 
                refreshToken
            };

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in AuthSessionService.signIn:", msg);
            throw error;
        }
    }


    async refreshAccessToken(refreshToken: string): Promise<string> {
        try {
            if (!refreshToken) {
                // message: "Your session has ended. Please log in again to continue."
                throw createHttpError(HttpStatus.UNAUTHORIZED, `${HttpResponse.SESSION_ENDED} ${HttpResponse.LOGIN_AGAIN}`);
            }
            
            const decoded = verifyRefreshToken(refreshToken);
            // console.log('Decoded refreshToken AuthSessionService.refreshAccessToken:', decoded);

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

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in AuthSessionService.refreshAccessToken:", msg);
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


        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in AuthSessionService.revokeRefreshToken:", msg);
            throw error;
        }
    }


    async getAuthUser(userId: string): Promise<AuthUserResponseDto> {
        try {
            const userData: UserEntity | null = await this._userRepository.getUserById(userId);

            if (!userData) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

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

            return safeUser;

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in AuthSessionService.getAuthUser:", msg);
            throw error;
        }
    }


}
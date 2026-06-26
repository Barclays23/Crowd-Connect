import { REDIS_TOKEN_PREFIX } from "@/config/redis-cache.config";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { AUTH_MESSAGES, USER_MESSAGES } from "@/constants/messages.constants";
import { USER_STATUS } from "@/constants/user-system.constants";
import { ResetPasswordDto } from "@/dtos/auth.dto";
import { SensitiveUserEntity, UserEntity } from "@/entities/user.entity";
import { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import { ICacheService } from "@/services/cache-services/interfaces/ICacheService";
import { IPasswordService } from "@/services/password-services/interfaces/IPasswordService";
import { comparePassword, hashPassword } from "@/utils/bcrypt.utils";
import { createHttpError } from "@/utils/httpError.utils";



export class PasswordService implements IPasswordService {
    constructor(
        private _userRepository: IUserRepository,
        private _cacheService: ICacheService,
    ) {}


    // when user fogot password and reset it
    async resetPassword({ token, newPassword }: ResetPasswordDto): Promise<string> {
        try {
            const redisKey = `${REDIS_TOKEN_PREFIX}${token}`;
            // const raw = await redisClient.get(redisKey);
            const raw = await this._cacheService.getKeyValue(redisKey);
            if (!raw) {
                throw createHttpError(HTTP_STATUS.NOT_FOUND, `${AUTH_MESSAGES.RESET_LINK_INVALID_OR_EXPIRED}`);
            }
            const tokenData = JSON.parse(raw);

            const hashedPassword = await hashPassword(newPassword);

            const updatedUser: UserEntity | null = await this._userRepository.updateUserPassword(tokenData.email, hashedPassword);

            if (!updatedUser) {
                throw createHttpError(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_ACCOUNT_NOT_EXIST);
            }

            // await redisClient.del(redisKey);
            await this._cacheService.deleteKeyValue(redisKey);

            return updatedUser.email;

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error("Error in PasswordService.resetPassword:", msg);
            throw error;
        }
    }


    // for user updating password when he need
    async changeUserPassword(userEmail: string, data: { currentPassword?: string; newPassword: string; }): Promise<void> {
        try {
            const currentUser: SensitiveUserEntity | null = await this._userRepository.findAuthUser({email: userEmail});

            if (!currentUser) throw createHttpError(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND);

            if (currentUser.status === USER_STATUS.BLOCKED) {
                throw createHttpError(HTTP_STATUS.FORBIDDEN, USER_MESSAGES.USER_ACCOUNT_BLOCKED);
            }

            if (currentUser.password) {
                if (!data.currentPassword) {
                    throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Current password is required.");
                }

                const isCurrentPasswordValid = await comparePassword(data.currentPassword, currentUser.password);

                if (!isCurrentPasswordValid) {
                    throw createHttpError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.PASSWORD_CURRENT_INCORRECT);
                }
            }

            // if user has no password exist in DB means he may created account using Google Auth.
            // so, no need to comparePassword

            const hashedPassword = await hashPassword(data.newPassword);

            const updatedUser: UserEntity | null = await this._userRepository.updateUserPassword(userEmail, hashedPassword);

            if (!updatedUser) {
                throw createHttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, AUTH_MESSAGES.PASSWORD_CHANGE_FAILED);
            }

            return;

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error in PasswordService.changeUserPassword:', msg);
            throw error;
        }
    }

}
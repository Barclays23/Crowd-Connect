import { REDIS_TOKEN_PREFIX, redisClient } from "@/config/redis.config";
import { AuthMessages, HttpResponse } from "@/constants/responseMessages.constants";
import { UserStatus } from "@/constants/roles-and-statuses";
import { HttpStatus } from "@/constants/statusCodes.constants";
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
                throw createHttpError(HttpStatus.NOT_FOUND, `${HttpResponse.RESET_LINK_INVALID_OR_EXPIRED}`);
            }
            const tokenData = JSON.parse(raw);

            const hashedPassword = await hashPassword(newPassword);

            const updatedUser: UserEntity | null = await this._userRepository.updateUserPassword(tokenData.email, hashedPassword);

            if (!updatedUser) {
                throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_ACCOUNT_NOT_EXIST);
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
    async changeUserPassword(userEmail: string, data: { currentPassword: string; newPassword: string; }): Promise<void> {
        try {
            const currentUser: SensitiveUserEntity | null = await this._userRepository.findAuthUser({email: userEmail});

            if (!currentUser) throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);

            if (currentUser.status === UserStatus.BLOCKED) {
                throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.USER_ACCOUNT_BLOCKED);
            }

            const isCurrentPasswordValid =  await comparePassword(data.currentPassword, currentUser.password)

            if (!isCurrentPasswordValid) {
                throw createHttpError(HttpStatus.UNAUTHORIZED, AuthMessages.PASSWORD_CURRENT_INCORRECT);
            }

            const hashedPassword = await hashPassword(data.newPassword);

            const updatedUser: UserEntity | null = await this._userRepository.updateUserPassword(userEmail, hashedPassword);

            if (!updatedUser) {
                throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, AuthMessages.PASSWORD_CHANGE_FAILED);
            }

            return;

            
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error in PasswordService.changeUserPassword:', msg);
            throw error;
        }
    }

}
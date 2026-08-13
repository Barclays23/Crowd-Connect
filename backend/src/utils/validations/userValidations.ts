// backend/src/utils/validations/userValidations.ts
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { HOST_MESSAGES, USER_MESSAGES } from "@/constants/messages.constants";
import { HOST_STATUS, USER_ROLES, USER_STATUS } from "@/constants/user-system.constants";
import { HostEntity, UserEntity, UserProfileEntity } from "@/entities/user.entity";
import { isHost } from "@/utils/general.utils";
import { createHttpError } from "@/utils/httpError.utils";





export function validateUserActiveStatus(userProfile: UserEntity | null): asserts userProfile is UserEntity {
    if (!userProfile) {
        throw createHttpError(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_ACCOUNT_NOT_EXIST);
    }

    if (userProfile.status === USER_STATUS.BLOCKED) {
        throw createHttpError(
            HTTP_STATUS.FORBIDDEN, USER_MESSAGES.USER_ACCOUNT_BLOCKED
        );
    }
}


// host validation for CREATE, UPDATE, DELETE, CANCEL, PUBLISH Event by host/organizer
export function validateHostActiveStatus(hostProfile: UserProfileEntity | null): asserts hostProfile is UserProfileEntity {

    validateUserActiveStatus(hostProfile);

    if (hostProfile.role !== USER_ROLES.HOST) {
        throw createHttpError(HTTP_STATUS.NOT_FOUND, HOST_MESSAGES.USER_NOT_A_HOST);
    }

    if (hostProfile.hostStatus === HOST_STATUS.BLOCKED) {
        throw createHttpError(
            HTTP_STATUS.FORBIDDEN, HOST_MESSAGES.HOST_BLOCKED
        );
    }

    if (hostProfile.hostStatus === HOST_STATUS.REJECTED) {
        throw createHttpError(
            HTTP_STATUS.FORBIDDEN, HOST_MESSAGES.HOST_ALREADY_REJECTED
        );
    }

    if (hostProfile.hostStatus === HOST_STATUS.PENDING) {
        throw createHttpError(
            HTTP_STATUS.FORBIDDEN, HOST_MESSAGES.HOST_APPLICATION_PENDING
        );
    }
}




export function validateAdminActiveStatus(adminProfile: UserProfileEntity | null): asserts adminProfile is UserProfileEntity {
    // Validates base user rules first (Checks if null or BLOCKED)
    validateUserActiveStatus(adminProfile);

    // Double-check the role at the database level
    if (adminProfile.role !== USER_ROLES.ADMIN) {
        throw createHttpError(
            HTTP_STATUS.FORBIDDEN, 
            "Unauthorized: Only administrators can perform this action."
        );
    }
}



export function validateAllowedToApplyRoleUpgrade(existingUser: UserProfileEntity | null): asserts existingUser is UserProfileEntity {
    validateUserActiveStatus(existingUser);

    const isAlreadyHost = isHost(existingUser);
    const isUser = existingUser.role === USER_ROLES.USER;

    const allowedToApply = isUser || (isAlreadyHost && existingUser?.hostStatus === HOST_STATUS.REJECTED);

    if (!allowedToApply) {
        if (isAlreadyHost) {
            const status = existingUser.hostStatus;
            if (status === HOST_STATUS.APPROVED) throw createHttpError(HTTP_STATUS.BAD_REQUEST, HOST_MESSAGES.HOST_ALREADY_APPROVED);
            if (status === HOST_STATUS.PENDING) throw createHttpError(HTTP_STATUS.BAD_REQUEST, HOST_MESSAGES.HOST_APPLICATION_PENDING);
            if (status === HOST_STATUS.BLOCKED) throw createHttpError(HTTP_STATUS.FORBIDDEN, HOST_MESSAGES.HOST_BLOCKED);
        }
    }

}


// for updating organization details and logo (by host);
export function validateAllowedToUpdateHost(existingUser: UserProfileEntity | null): asserts existingUser is UserProfileEntity {
    validateUserActiveStatus(existingUser);

    if (existingUser.role !== USER_ROLES.HOST) {
        throw createHttpError(HTTP_STATUS.NOT_FOUND, HOST_MESSAGES.USER_NOT_A_HOST);
    }

    if (existingUser.hostStatus === HOST_STATUS.BLOCKED) {
        throw createHttpError(
            HTTP_STATUS.FORBIDDEN, HOST_MESSAGES.HOST_BLOCKED
        );
    }

    // need to re consider this (when re-applying host application, host details are updating actually)
    // only allowed to update via re-apply or direct editing via profile??
    // if (existingUser.hostStatus === HOST_STATUS.REJECTED) {
    //     throw createHttpError(
    //         HTTP_STATUS.FORBIDDEN, HOST_MESSAGES.HOST_ALREADY_REJECTED + 'You need to re-apply the application.'
    //     );
    // }
}


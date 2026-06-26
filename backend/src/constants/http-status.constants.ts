// backend/src/constants/http-status.constants.ts

export const HTTP_STATUS = {
    // Success
    OK                    : 200,
    CREATED               : 201,

    // Client Errors
    BAD_REQUEST           : 400,
    UNAUTHORIZED          : 401,
    FORBIDDEN             : 403,
    NOT_FOUND             : 404,
    CONFLICT              : 409,
    TOO_MANY_REQUESTS     : 429,

    // Server Errors
    INTERNAL_SERVER_ERROR : 500,
    BAD_GATEWAY           : 502,
    SERVICE_UNAVAILABLE   : 503,
    GATEWAY_TIMEOUT       : 504,
} as const;


export type HttpStatusType = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
// frontend/src/constants/apiEndpoints.constants.ts

// only for the Google Auth (not using exios)
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;


// base prefixes
const API_PREFIX = {
    USER        : "/api/user",
    ADMIN       : "/api/admin",
    EVENT       : "/api/event",
    BOOKING     : "/api/booking",
    SETTINGS    : "/api/settings",
    AUTH        : "/api/auth",
} as const;



// exact endpoints using the prefixes
export const API_ENDPOINTS = {
    USER: {
        PROFILE         : `${API_PREFIX.USER}/profile`,
        EDIT_BASIC_INFO : `${API_PREFIX.USER}/edit-basic-info`,
        PROFILE_PIC     : `${API_PREFIX.USER}/profile-pic`,
        CHANGE_PASSWORD : `${API_PREFIX.USER}/change-password`,
    },
    
    ADMIN: {
        USERS           : `${API_PREFIX.ADMIN}/users`,
        USER_ACTION     : (userId: string) => `${API_PREFIX.ADMIN}/users/${userId}`,
        TOGGLE_BLOCK    : (userId: string) => `${API_PREFIX.ADMIN}/users/${userId}/toggle-block`,
    },

    EVENT: {
        CREATE          : `${API_PREFIX.EVENT}/create-event`,
        TRENDING        : `${API_PREFIX.EVENT}/trending-events`,
        MY_EVENTS       : `${API_PREFIX.EVENT}/my-events`,
        DETAILS         : (eventId: string) => `${API_PREFIX.EVENT}/events/${eventId}`,
    },

    BOOKING: {
        MY_BOOKINGS     : `${API_PREFIX.BOOKING}/my-bookings`,
        INITIATE        : (eventId: string) => `${API_PREFIX.EVENT}/${eventId}/initiate-booking`,
    },

    SETTINGS: {
        BASE            : API_PREFIX.SETTINGS,
    },

    AUTH: {
        REGISTER            : `${API_PREFIX.AUTH}/register`,
        LOGIN               : `${API_PREFIX.AUTH}/login`,
        FORGOT_PASSWORD     : `${API_PREFIX.AUTH}/forgot-password`,
        VALIDATE_RESET_LINK : (token: string) => `${API_PREFIX.AUTH}/reset-password/validate/${token}`,
        RESET_PASSWORD      : `${API_PREFIX.AUTH}/reset-password`,
        AUTHENTICATE_EMAIL  : `${API_PREFIX.AUTH}/authenticate-email`,
        VERIFY_EMAIL        : `${API_PREFIX.AUTH}/verify-email`,
        VERIFY_ACCOUNT      : `${API_PREFIX.AUTH}/verify-account`,
        RESEND_OTP          : `${API_PREFIX.AUTH}/resend-otp`,
        ME                  : `${API_PREFIX.AUTH}/me`,
        REFRESH_TOKEN       : `${API_PREFIX.AUTH}/refresh-token`,
        LOGOUT              : `${API_PREFIX.AUTH}/logout`,

        GOOGLE_LOGIN_URL    : `${BACKEND_BASE_URL}${API_PREFIX.AUTH}/google`,
    }
};
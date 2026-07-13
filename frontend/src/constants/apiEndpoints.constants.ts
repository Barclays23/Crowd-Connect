// frontend/src/constants/apiEndpoints.constants.ts

// only for the Google Auth (not using exios)
const BACKEND_BASE_URL: string = import.meta.env.VITE_BACKEND_BASE_URL || "";


// base prefixes
const API_PREFIX = {
    ADMIN    : "/api/admin",
    AI       : "/api/ai",
    AUTH     : "/api/auth",
    BOOKING  : "/api/booking",
    CHECKIN  : "/api/checkin",
    EVENT    : "/api/event",
    HOST     : "/api/host",
    PAYOUT   : "/api/payout",
    SETTINGS : "/api/settings",
    USER     : "/api/user",
    WALLET   : "/api/wallet",
} as const;



// exact endpoints using the prefixes
export const API_ENDPOINTS = {
    USER: {
        PROFILE         : `${API_PREFIX.USER}/profile`,
        BASIC_INFO      : `${API_PREFIX.USER}/basic-info`,
        PROFILE_PIC     : `${API_PREFIX.USER}/profile-pic`,
        CHANGE_PASSWORD : `${API_PREFIX.USER}/change-password`,
    },
    
    ADMIN: {
        // user management
        USERS           : `${API_PREFIX.ADMIN}/users`,
        USER_ACTION     : (userId: string) => `${API_PREFIX.ADMIN}/users/${userId}`,
        TOGGLE_BLOCK    : (userId: string) => `${API_PREFIX.ADMIN}/users/${userId}/toggle-block`,
        CONVERT_TO_HOST : (userId: string) => `${API_PREFIX.ADMIN}/users/${userId}/convert-host`,

        // host management
        HOSTS               : `${API_PREFIX.ADMIN}/hosts`,
        MANAGE_HOST_REQUEST : (hostId: string) => `${API_PREFIX.ADMIN}/hosts/${hostId}/manage-host-request`,
        UPDATE_HOST         : (hostId: string) => `${API_PREFIX.ADMIN}/hosts/${hostId}/update-host`,

        // event management
        EVENTS          : `${API_PREFIX.ADMIN}/events`,
        UPDATE_EVENT    : (eventId: string) => `${API_PREFIX.ADMIN}/events/${eventId}/update`,
        SUSPEND_EVENT   : (eventId: string) => `${API_PREFIX.ADMIN}/events/${eventId}/suspend`,
        DELETE_EVENT    : (eventId: string) => `${API_PREFIX.ADMIN}/events/${eventId}`,
        
        // booking management
        BOOKINGS        : `${API_PREFIX.ADMIN}/bookings`,
        CANCEL_BOOKING  : (bookingId: string) => `${API_PREFIX.ADMIN}/bookings/${bookingId}/cancel`,
        
        // payout management
        PAYOUTS         : `${API_PREFIX.ADMIN}/payouts`,
        REVIEW_PAYOUT   : (payoutId: string) => `${API_PREFIX.ADMIN}/payouts/${payoutId}/review`,

    },

    EVENT: {
        CREATE          : `${API_PREFIX.EVENT}/create-event`,
        TRENDING        : `${API_PREFIX.EVENT}/trending-events`,
        MY_EVENTS       : `${API_PREFIX.EVENT}/my-events`,
        PUBLIC_EVENTS   : `${API_PREFIX.EVENT}/public-events`,
        DETAILS         : (eventId: string) => `${API_PREFIX.EVENT}/events/${eventId}`,
        UPDATE          : (eventId: string) => `${API_PREFIX.EVENT}/${eventId}/update`,
        PUBLISH         : (eventId: string) => `${API_PREFIX.EVENT}/${eventId}/publish`,
        CANCEL          : (eventId: string) => `${API_PREFIX.EVENT}/${eventId}/cancel`,
    },

    BOOKING: {
        MY_BOOKINGS     : `${API_PREFIX.BOOKING}/my-bookings`,
        // INITIATE        : (eventId: string) => `${API_PREFIX.EVENT}/${eventId}/initiate-booking`,
        INITIATE        : (eventId: string) => `${API_PREFIX.BOOKING}/initiate/${eventId}`,
        DETAILS         : (bookingId: string) => `${API_PREFIX.BOOKING}/${bookingId}`,
        VERIFY_PAYMENT  : (bookingId: string) => `${API_PREFIX.BOOKING}/${bookingId}/verify-payment`, 
        RETRY_PAYMENT   : (bookingId: string) => `${API_PREFIX.BOOKING}/${bookingId}/retry-payment`, 
        CANCEL          : (bookingId: string) => `${API_PREFIX.BOOKING}/${bookingId}/cancel`,
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
    },

    HOST: {
        // DASHBOARD           : `${API_PREFIX.HOST}/dashboard`,  // using anywhere ??
        // MY_LISTINGS         : `${API_PREFIX.HOST}/listings`,  // using anywhere ??
        // ONBOARDING          : `${API_PREFIX.HOST}/onboarding`,  // using anywhere ??
        APPLY_UPGRADE       : `${API_PREFIX.HOST}/apply-upgrade`,
        UPDATE_DETAILS      : `${API_PREFIX.HOST}/update-details`,
    },

    PAYOUT: {
        ELIGIBLE_EVENTS    : `${API_PREFIX.PAYOUT}/eligible-events`,
        MY_PAYOUTS         : `${API_PREFIX.PAYOUT}/my-payouts`,
        REQUEST            : (eventId: string) => `${API_PREFIX.PAYOUT}/events/${eventId}/request`,
    },

    WALLET: {
        BALANCE         : `${API_PREFIX.WALLET}/balance`,
        OVERVIEW        : `${API_PREFIX.WALLET}/my-wallet`,
        TRANSACTIONS    : `${API_PREFIX.WALLET}/transactions`,
        // ADD_FUNDS       : `${API_PREFIX.WALLET}/add-funds`,
    },

    AI: {
        GENERATE_EVENT_POSTER : `${API_PREFIX.AI}/generate-event-poster`,
    },

    CHECKIN: {
        QR_SCAN         : (eventId: string) => `${API_PREFIX.CHECKIN}/${eventId}/scan`,
        VERIFY          : (bookingId: string) => `${API_PREFIX.CHECKIN}/verify/${bookingId}`,  // using this route anywhare??
        ATTENDEES       : (eventId: string) => `${API_PREFIX.CHECKIN}/${eventId}/attendees`,
        // ATTENDEES       : (eventId: string): string => `${API_PREFIX.CHECKIN}/events/${eventId}/attendees`,
    }
};
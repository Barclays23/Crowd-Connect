// frontend/src/constants/apiEndpoints.constants.ts

// only for the Google Auth (not using exios)
const BACKEND_BASE_URL: string = import.meta.env.VITE_BACKEND_BASE_URL || "";


// base prefixes
const API_PREFIX = {
    ADMIN               : "/api/admin",
    AI                  : "/api/ai",
    AUTH                : "/api/auth",
    BOOKING             : "/api/booking",
    CHAT                : "/api/chat",
    CHECKIN             : "/api/checkin",
    EVENT               : "/api/event",
    HOST                : "/api/host",
    NOTIFICATION        : "/api/notifications",
    PAYOUT              : "/api/payout",
    REVIEW              : "/api/reviews",
    SETTINGS            : "/api/settings",
    USER                : "/api/user",
    WALLET              : "/api/wallet",
    USER_DASHBOARD      : "/api/user/dashboard",
    ADMIN_DASHBOARD     : "/api/admin/dashboard",
} as const;



// exact endpoints using the prefixes
export const API_ENDPOINTS = {

    ADMIN: {
        // user management
        USERS           : `${API_PREFIX.ADMIN}/users`,
        USER_ACTION     : (userId: string) => `${API_PREFIX.ADMIN}/users/${userId}`,
        TOGGLE_BLOCK    : (userId: string) => `${API_PREFIX.ADMIN}/users/${userId}/toggle-block`,
        CONVERT_TO_HOST : (userId: string) => `${API_PREFIX.ADMIN}/users/${userId}/convert`,

        // host management
        HOSTS                   : `${API_PREFIX.ADMIN}/hosts`,
        MANAGE_HOST_APPLICATION : (hostId: string) => `${API_PREFIX.ADMIN}/hosts/${hostId}/application`,
        MANAGE_HOST_PERMISSION  : (hostId: string) => `${API_PREFIX.ADMIN}/hosts/${hostId}/permission`,
        UPDATE_HOST_DETAILS     : (hostId: string) => `${API_PREFIX.ADMIN}/hosts/${hostId}/details`,
        UPDATE_HOST_LOGO        : (hostId: string) => `${API_PREFIX.ADMIN}/hosts/${hostId}/logo`,

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
        
        // review & rating management
        REVIEWS : `${API_PREFIX.ADMIN}/reviews`,
    },

    AI: {
        GENERATE_EVENT_POSTER : `${API_PREFIX.AI}/generate-event-poster`,
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
    
    BOOKING: {
        MY_BOOKINGS     : `${API_PREFIX.BOOKING}/my-bookings`,
        // INITIATE        : (eventId: string) => `${API_PREFIX.EVENT}/${eventId}/initiate-booking`,
        INITIATE        : (eventId: string) => `${API_PREFIX.BOOKING}/initiate/${eventId}`,
        DETAILS         : (bookingId: string) => `${API_PREFIX.BOOKING}/${bookingId}`,
        VERIFY_PAYMENT  : (bookingId: string) => `${API_PREFIX.BOOKING}/${bookingId}/verify-payment`, 
        RETRY_PAYMENT   : (bookingId: string) => `${API_PREFIX.BOOKING}/${bookingId}/retry-payment`, 
        CANCEL          : (bookingId: string) => `${API_PREFIX.BOOKING}/${bookingId}/cancel`,
    },

    CHAT: {
        ASK             : `${API_PREFIX.CHAT}/ask`,
    },

    CHECKIN: {
        QR_SCAN         : (eventId: string) => `${API_PREFIX.CHECKIN}/${eventId}/scan`,
        VERIFY          : (bookingId: string) => `${API_PREFIX.CHECKIN}/verify/${bookingId}`,  // using this route anywhare??
        ATTENDEES       : (eventId: string) => `${API_PREFIX.CHECKIN}/${eventId}/attendees`,  // or attendance
        // ATTENDEES       : (eventId: string): string => `${API_PREFIX.CHECKIN}/events/${eventId}/attendees`,
    },

    EVENT: {
        CREATE              : `${API_PREFIX.EVENT}/create-event`,
        TRENDING            : `${API_PREFIX.EVENT}/trending-events`,
        MY_EVENTS           : `${API_PREFIX.EVENT}/my-events`,
        PUBLIC_EVENTS       : `${API_PREFIX.EVENT}/public-events`,
        DETAILS             : (eventId: string) => `${API_PREFIX.EVENT}/events/${eventId}`,
        UPDATE              : (eventId: string) => `${API_PREFIX.EVENT}/${eventId}/update`,
        PUBLISH             : (eventId: string) => `${API_PREFIX.EVENT}/${eventId}/publish`,
        CANCEL              : (eventId: string) => `${API_PREFIX.EVENT}/${eventId}/cancel`,
        DELETE              : (eventId: string) => `${API_PREFIX.EVENT}/${eventId}`,
        BOOKINGS_OF_EVENT   : (eventId: string) => `${API_PREFIX.EVENT}/${eventId}/bookings`,
        ORGANISER_EVENTS    : (hostId: string) => `${API_PREFIX.EVENT}/organiser/${hostId}/events`,

        JOIN_ONLINE         : (eventId: string) => `${API_PREFIX.EVENT}/${eventId}/join-online`,
    },

    HOST: {
        APPLY_UPGRADE          : `${API_PREFIX.HOST}/apply-upgrade`,
        ORGANIZER_DETAILS      : `${API_PREFIX.HOST}/organiser-details`,
        ORGANIZER_LOGO         : `${API_PREFIX.HOST}/organiser-logo`,
        ORGANISER_PROFILE      : (hostId: string) => `${API_PREFIX.HOST}/organiser/${hostId}`,
    },

    NOTIFICATION: {
        BASE                : API_PREFIX.NOTIFICATION,
        UNREAD_COUNT        : `${API_PREFIX.NOTIFICATION}/unread-count`,
        MARK_READ           : (notificationId: string) => `${API_PREFIX.NOTIFICATION}/${notificationId}/read`,
        MARK_ALL_READ       : `${API_PREFIX.NOTIFICATION}/read-all`,
    },

    PAYOUT: {
        ELIGIBLE_EVENTS    : `${API_PREFIX.PAYOUT}/eligible-events`,
        MY_PAYOUTS         : `${API_PREFIX.PAYOUT}/my-payouts`,
        REQUEST            : (eventId: string) => `${API_PREFIX.PAYOUT}/events/${eventId}/request`,
    },

    REVIEW: {
        SUBMIT_REVIEW   : `${API_PREFIX.REVIEW}`,
        MANAGE_REVIEW   : (reviewId: string) => `${API_PREFIX.REVIEW}/${reviewId}`,  // edit or delete review
        HOST_REVIEWS    : (hostId: string) => `${API_PREFIX.REVIEW}/host/${hostId}`,
        EVENT_REVIEWS   : (eventId: string) => `${API_PREFIX.REVIEW}/events/${eventId}`,
        MY_REVIEWS      : `${API_PREFIX.REVIEW}/my-reviews`,
        
    },

    SETTINGS: {
        BASE            : API_PREFIX.SETTINGS, // GET all settings
        OPERATIONAL     : `${API_PREFIX.SETTINGS}/operational`,
        TERMS           : `${API_PREFIX.SETTINGS}/terms`,
    },

    USER: {
        PROFILE         : `${API_PREFIX.USER}/profile`,
        BASIC_INFO      : `${API_PREFIX.USER}/basic-info`,
        PROFILE_PIC     : `${API_PREFIX.USER}/profile-pic`,
        CHANGE_PASSWORD : `${API_PREFIX.USER}/change-password`,
    },

    USER_DASHBOARD: {
        OVERVIEW          : `${API_PREFIX.USER_DASHBOARD}/overview`,
        BOOKINGS_CHART    : `${API_PREFIX.USER_DASHBOARD}/bookings-chart`,
        SPENDING_CHART    : `${API_PREFIX.USER_DASHBOARD}/spending-chart`,
        CATEGORY_CHART    : `${API_PREFIX.USER_DASHBOARD}/category-chart`,
        STATUS_CHART      : `${API_PREFIX.USER_DASHBOARD}/status-chart`,

        // host specific
        HOST_EVENTS_BY_STATUS    : `${API_PREFIX.USER_DASHBOARD}/host-events-by-status`,
        HOST_EVENTS_BY_CATEGORY  : `${API_PREFIX.USER_DASHBOARD}/host-events-by-category`,
        HOST_TICKETS_SOLD_CHART  : `${API_PREFIX.USER_DASHBOARD}/host-tickets-sold-chart`,
        HOST_RATING_DISTRIBUTION : `${API_PREFIX.USER_DASHBOARD}/host-rating-distribution`,
    },

    ADMIN_DASHBOARD: {
        OVERVIEW              : `${API_PREFIX.ADMIN_DASHBOARD}/overview`,
        REVENUE_CHART         : `${API_PREFIX.ADMIN_DASHBOARD}/revenue-chart`,
        USER_GROWTH_CHART     : `${API_PREFIX.ADMIN_DASHBOARD}/user-growth-chart`,
        EVENTS_BY_CATEGORY    : `${API_PREFIX.ADMIN_DASHBOARD}/events-by-category`,
        EVENTS_BY_STATUS      : `${API_PREFIX.ADMIN_DASHBOARD}/events-by-status`,
        TOP_HOSTS             : `${API_PREFIX.ADMIN_DASHBOARD}/top-hosts`,
    },

    WALLET: {
        BALANCE         : `${API_PREFIX.WALLET}/balance`,
        OVERVIEW        : `${API_PREFIX.WALLET}/my-wallet`,
        TRANSACTIONS    : `${API_PREFIX.WALLET}/transactions`,
        // ADD_FUNDS       : `${API_PREFIX.WALLET}/add-funds`,
    },




};
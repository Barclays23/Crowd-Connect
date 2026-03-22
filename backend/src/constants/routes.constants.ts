// backend/src/constants/routes.constants.ts


export const AUTH_ROUTES = {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',

    RESET_PASSWORD_VALIDATE: '/reset-password/validate/:token', 
    RESET_PASSWORD: '/reset-password',

    VERIFY_ACCOUNT: '/verify-account',
    AUTHENTICATE_EMAIL: '/authenticate-email',
    VERIFY_EMAIL: '/verify-email',
    RESEND_OTP: '/resend-otp',
    REFRESH_TOKEN: '/refresh-token',
    LOGOUT: '/logout',
    ME: '/me',
} as const;





export const USER_ROUTES = {
    GET_PROFILE: '/profile',
    EDIT_BASIC_INFO: '/edit-basic-info',
    UPDATE_PROFILE_PIC: '/profile-pic',
    CHANGE_PASSWORD: '/change-password',
} as const;





export const HOST_ROUTES = {
    APPLY_UPGRADE: '/apply-upgrade',
} as const;




export const EVENT_ROUTES = {
    CREATE_EVENT: '/create-event',
    UPDATE_EVENT: '/:eventId/update',
    PUBLISH_EVENT: '/:eventId/publish',
    CANCEL_EVENT: '/:eventId/cancel',
    MY_EVENTS: '/my-events',
    PUBLIC_EVENTS: '/public-events',
    EVENT_DETAILS: '/events/:eventId',
    INITIATE_BOOKING: '/:eventId/initiate-booking',
} as const;



export const BOOKING_ROUTES = {
    CANCEL_BOOKING: '/:bookingId/cancel',
    MY_BOOKINGS: '/my-bookings',
    BOOKING_DETAILS: '/:bookingId',
    VERIFY_PAYMENT: '/:bookingId/verify-payment'
} as const;




export const ADMIN_ROUTES = {
    // User Management
    GET_USERS: '/users',
    CREATE_USER: '/users',
    EDIT_USER: '/users/:id',
    DELETE_USER: '/users/:id',
    TOGGLE_BLOCK_USER: '/users/:id/toggle-block',

    // Host Management
    GET_HOSTS: '/hosts',
    MANAGE_HOST_REQUEST: '/hosts/:hostId/manage-host-request',
    UPDATE_HOST: '/hosts/:hostId/update-host',
    
    
    // Event Mangement
    GET_EVENTS: '/events',
    SUSPEND_EVENT: '/events/:eventId/suspend',
    UPDATE_EVENT: '/events/:eventId/update',
    DELETE_EVENT: '/events/:eventId',
    
    
    // Booking Mangement
    GET_BOOKINGS: '/bookings',
    CANCEL_BOOKING: '/bookings/:bookingId/cancel'

} as const;
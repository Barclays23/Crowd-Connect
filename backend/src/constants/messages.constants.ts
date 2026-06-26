// backend/src/constants/messages.constants.ts

import { 
    MIN_TICKETS_PER_BOOKING, 
    OFFLINE_MAX_TICKETS_PER_BOOKING, 
    OFFLINE_MAX_TICKETS_PER_USER, 
    ONLINE_MAX_TICKETS_PER_USER 
} from "@/constants/booking.constants";



export enum HTTP_RESPONSE {
    EMAIL_EXIST = "An account with this email is already exists",
    MOBILE_EXIST = "An account with this mobile number is already exists",
    GOOGLE_LOGIN_SUCCESS = "Logged in with Google successfully",
    INVALID_CREDENTIALS = "Invalid credentials",
    INVALID_EMAIL = "Invalid email address",
    INVALID_ID = "Invalid ID format",
    INVALID_USER_ID = "Invalid user ID format",
    INVALID_USER_ROLE_CREATION = "Invalid role provided. User role should be either user or admin.",
    INVALID_USER_STATUS_CREATION = "Invalid status. User status should only be pending for new users.",
    INSUFFICIENT_PERMISSION = "You have no permission to perform this action.",
    INTERNAL_SERVER_ERROR = "Internal server error.",
    LOGOUT_SUCCESS = "Logged out successfully.",
    LOGIN_SUCCESS = "Logged in successfully.",
    LOGIN_FAILED = "Login attempt failed.",
    LOGIN_AGAIN = "Please log in again to continue.",
    NO_PAYLOAD = "Payload not found",
    NO_CHANGE_MADE = "It looks like you haven't changed anything. Make at least one change to save an update.",
    OTP_INCORRECT = "Incorrect OTP, please enter the correct code.",
    OTP_RESENT = "A new OTP has been sent to your email.",
    OTP_SENT = "We've sent an OTP to your email.",
    OTP_SEND_FAILED = "Failed to send OTP. Please try again.",
    VERIFY_ACCOUNT = "Please verify to activate your account.",
    EMAIL_VERIFICATION_SENT = "Verification code sent. Check your email to verify.",
    EMAIL_ALREADY_VERIFIED = "Your email address is already verified.",
    EMAIL_VERIFIED = "Success! Your email is now verified and updated.",
    OTP_EXPIRED = "Your verification code has expired. Please request a new OTP.",
    OTP_VERIFICATION_SUCCESS = "OTP verified successfully.",
    PAGE_NOT_FOUND = "Route not found",
    PASSWORD_RESET_EMAIL_SENT= "Done! We've sent a reset link to your email.",
    PASSWORD_RESET_SUCCESS = "Password has been reset successfully",
    PASSWORD_RESET_FAILED = "Failed to reset password. Please try again.",
    RESET_LINK_INVALID_OR_EXPIRED = "This password reset link is invalid or has expired. Please request a new one.",
    PASSWORD_CHANGE_SUCCESS = "Password changed successfully",
    PASSWORD_INCORRECT = "Incorrect password, try again",
    PROFILE_PICTURE_CHANGED = "Profile picture changed successfully",
    RESET_PASS_LINK = "Password reset link has been sent to your email",
    SESSION_ENDED = "Your session has ended.",  // ttl ended or invalidated (dg: cookie deleted by user, expired cookie etc).
    SESSION_EXPIRED = "Your session has expired.", // time expired like TTL (eg: redis data, jwt token etc invalidated by server).
    TOKEN_INVALID_OR_EXPIRED = "Your token is invalid or expired. Please log in again.",
    TOKEN_MISSING = "Access Denied: Missing authentication token.",
    TOKEN_REVOKED = "Your token has been revoked. Please log in again.",
    TOO_MANY_REQUESTS = "Too many requests, please try again later",
    ACCESS_TOKEN_REFRESHED = "Access token refreshed successfully.",
    TRY_AGAIN = "Please try again.",
    TRY_AGAIN_LATER = "Please try again later.",
    UNAUTHORIZED_ACCESS = "Unauthorized access",
    UNEXPECTED_KEY_FOUND = "Unexpected key found",
    USER_CREATION_FAILED = "We were unable to create your account.",
    USER_VERIFICATION_PENDING = "Your account is ready. Check your email to verify OTP and activate your account.",
    USER_CREATION_SUCCESS = " Your account is now active.",
    USER_EXIST = "User already exists",
    USER_NOT_FOUND = "We couldn't find a user with these credentials.",
    HOST_NOT_FOUND = "Couldn't find this host user.",
    EVENT_NOT_FOUND = "Coundn't find this event.",
    USER_NOT_A_HOST = "The user is not a host right now.",
    USER_ACCOUNT_NOT_EXIST = "Your account is removed or no longer available. Please contact support.",
    USER_ACCOUNT_BLOCKED = "Your account has been blocked. Please contact support.",

    HOST_ALREADY_APPROVED = "Hosting application is already approved.",
    HOST_ALREADY_REJECTED = "Hosting application is already rejected.",
    HOST_ALREADY_BLOCKED = "Host user is already blocked.",
    HOST_APPLICATION_PENDING = "Your hosting application is already pending.",
    HOST_APPLY_SUCCESS = "Host upgrade application submitted successfully.",
    HOST_APPLY_FAILED = "Failed to submit host upgrade application.",
    HOST_APPROVE_SUCCESS = "Host application approved.",
    HOST_UPDATE_SUCCESS = "Host details has been updated.",
    HOST_UPDATE_FAILED = "Failed to update host details.",
    HOST_REJECT_SUCCESS = "Host application rejected.",
    HOST_BLOCKED = "Your hosting permissions are blocked by admin.",
    HOST_BLOCK_SUCCESS = "Host has been blocked.",
    HOST_UNBLOCK_SUCCESS = "Host has been unblocked.",

    SUCCESS_BLOCK_USER = "User has been blocked.",
    SUCCESS_GET_USERS = "Users fetched successfully.",
    SUCCESS_GET_HOSTS = "Hosts fetched successfully.",
    SUCCESS_CREATE_USER = "User account created.",
    SUCCESS_CREATE_EVENT = "Event created successfully. Publish to make it live.",
    SUCCESS_UPDATE_EVENT = "Event has been updated.",
    SUCCESS_UPDATE_USER = "User details updated.",
    SUCCESS_UPDATE_PROFILE = "Profile updated successfully.",
    SUCCESS_DELETE_USER = "User has been deleted.",
    SUCCESS_DELETE_EVENT = "Event has been deleted",
    SUCCESS_SUSPEND_EVENT = "Event has been suspended.",
    SUCCESS_PUBLISH_EVENT = "Event has been published.",
    SUCCESS_UNBLOCK_USER = "User has been unblocked.",

    
    FAILED_GET_USERS = "Failed to fetch users.",
    FAILED_CREATE_USER = "Failed to create user.",
    FAILED_CREATE_EVENT = "Oops! We couldn’t create your event.",
    FAILED_UPDATE_EVENT = "Oops! We couldn’t update your event.",
    FAILED_UPDATE_PROFILE = "Failed to update profile.",
    FAILED_UPDATE_USER = "Failed to update user.",
    FAILED_UPDATE_USER_STATUS = "Failed to update user status.",
    FAILED_DELETE_USER = "Failed to delete user.",

    FAILED_GET_HOSTS = "Failed to fetch hosts.",
    CANNOT_CHANGE_VERIFIED_EMAIL = "Verified email address cannot be changed.",
    CANNOT_CHANGE_HOST_ROLE = "Role modification is restricted for Host accounts.",
    CANNOT_CHANGE_HOST_DIRECTLY = "Direct role changes to Host are not permitted. Please use the Role Upgrade Portal.",
    CANNOT_CHANGE_SUPER_ADMIN_ROLE = "Super Admin role cannot be changed.",

    ADMIN_CANNOT_CREATE_ADMIN = "Only Super Admin can create another Admin",
    ADMIN_CANNOT_EDIT_SELF = "You cannot edit your own account",
    ADMIN_CANNOT_EDIT_ADMIN = "Only Super Admin can edit another Admin",
    ADMIN_CANNOT_EDIT_SUPER_ADMIN = "Super Admin cannot be edited",
    ADMIN_CANNOT_BLOCK_SELF = "You cannot block your own account",
    ADMIN_CANNOT_BLOCK_ADMIN = "Only Super Admin can block another Admin",
    ADMIN_CANNOT_BLOCK_SUPER_ADMIN = "Super Admin cannot be blocked",
    ADMIN_CANNOT_DELETE_SELF = "You cannot delete your own account",
    ADMIN_CANNOT_DELETE_ADMIN = "Only Super Admin can delete another Admin",
    ADMIN_CANNOT_DELETE_SUPER_ADMIN = "Super Admin cannot be deleted",
}





// ─── AUTHENTICATION & SECURITY ──────────────────────────────────────────────
export const AUTH_MESSAGES = {
    EMAIL_EXIST : "An account with this email already exists",
    MOBILE_EXIST : "An account with this mobile number already exists",
    GOOGLE_LOGIN_SUCCESS : "Logged in with Google successfully",
    INVALID_CREDENTIALS : "Invalid credentials",
    LOGOUT_SUCCESS : "Logged out successfully.",
    LOGIN_SUCCESS : "Logged in successfully.",
    LOGIN_FAILED : "Login attempt failed.",
    LOGIN_AGAIN : "Please log in again to continue.",
    
    // OTP & Verification
    OTP_INCORRECT : "Incorrect OTP, please enter the correct code.",
    OTP_RESENT : "A new OTP has been sent to your email.",
    OTP_SENT : "We've sent an OTP to your email.",
    OTP_SEND_FAILED : "Failed to send OTP. Please try again.",
    OTP_EXPIRED : "Your verification code has expired. Please request a new OTP.",
    OTP_VERIFICATION_SUCCESS : "OTP verified successfully.",
    VERIFY_ACCOUNT : "Please verify to activate your account.",
    EMAIL_VERIFICATION_SENT : "Verification code sent. Check your email to verify.",
    EMAIL_ALREADY_VERIFIED : "Your email address is already verified.",
    EMAIL_VERIFIED : "Success! Your email is now verified and updated.",
    
    // Password Reset
    PASSWORD_RESET_EMAIL_SENT : "Done! We've sent a reset link to your email.",
    PASSWORD_RESET_SUCCESS : "Password has been reset successfully",
    PASSWORD_RESET_FAILED : "Failed to reset password. Please try again.",
    RESET_LINK_INVALID_OR_EXPIRED : "This password reset link is invalid or has expired. Please request a new one.",
    PASSWORD_CHANGE_SUCCESS : "Password changed successfully",
    PASSWORD_CHANGE_FAILED : "Failed to update password",
    PASSWORD_INCORRECT : "Incorrect password, try again",
    PASSWORD_CURRENT_INCORRECT : "Current password is incorrect",
    RESET_PASS_LINK : "Password reset link has been sent to your email",
    
    // Tokens & Sessions
    SESSION_ENDED : "Your session has ended.",
    SESSION_EXPIRED : "Your session has expired.",
    TOKEN_INVALID_OR_EXPIRED : "Your token is invalid or expired. Please log in again.",
    TOKEN_MISSING : "Access Denied: Missing authentication token.",
    TOKEN_REVOKED : "Your token has been revoked. Please log in again.",
    ACCESS_TOKEN_REFRESHED : "Access token refreshed successfully.",
    UNAUTHORIZED_ACCESS : "Unauthorized access",
}

// ─── GENERAL SYSTEM MESSAGES ───────────────────────────────────────────────
export const SYSTEM_MESSAGES = {
    INTERNAL_SERVER_ERROR : "Internal server error.",
    INSUFFICIENT_PERMISSION : "You have no permission to perform this action.",
    INVALID_ID : "Invalid ID format",
    INVALID_EMAIL : "Invalid email address",
    NO_PAYLOAD : "Payload not found",
    NO_CHANGE_MADE : "It looks like you haven't changed anything. Make at least one change to save an update.",
    PAGE_NOT_FOUND : "Route not found",
    TOO_MANY_REQUESTS : "Too many requests, please try again later",
    TRY_AGAIN : "Please try again.",
    TRY_AGAIN_LATER : "Please try again later.",
    UNEXPECTED_KEY_FOUND : "Unexpected key found",
}


// ─── USER MANAGEMENT ────────────────────────────────────────────────────────
export const USER_MESSAGES = {
    INVALID_USER_ID : "Invalid user ID format",
    USER_CREATION_FAILED : "We were unable to create your account.",
    USER_VERIFICATION_PENDING : "Your account is ready. Check your email to verify OTP and activate your account.",
    USER_CREATION_SUCCESS : "Your account is now active.",
    USER_EXIST : "User already exists",
    USER_INFORMATION_MISSING : "User information is missing.",
    USER_NOT_FOUND : "We couldn't find a user with these credentials.",
    USER_ACCOUNT_NOT_EXIST : "Your account is removed or no longer available. Please contact support.",
    USER_ACCOUNT_BLOCKED : "Your account has been blocked. Please contact support.",
    PROFILE_PICTURE_CHANGED : "Profile picture changed successfully",
    SUCCESS_BLOCK_USER : "User has been blocked.",
    SUCCESS_GET_USERS : "Users fetched successfully.",
    SUCCESS_CREATE_USER : "User account created.",
    SUCCESS_UPDATE_USER : "User details updated.",
    SUCCESS_UPDATE_PROFILE : "Profile updated successfully.",
    SUCCESS_DELETE_USER : "User has been deleted.",
    SUCCESS_UNBLOCK_USER : "User has been unblocked.",
    FAILED_GET_USERS : "Failed to fetch users.",
    FAILED_CREATE_USER : "Failed to create user.",
    FAILED_UPDATE_PROFILE : "Failed to update profile.",
    FAILED_UPDATE_USER : "Failed to update user.",
    FAILED_UPDATE_USER_STATUS : "Failed to update user status.",
    FAILED_DELETE_USER : "Failed to delete user.",
    CANNOT_CHANGE_VERIFIED_EMAIL : "Verified email address cannot be changed.",
}



// ─── HOST MANAGEMENT ────────────────────────────────────────────────────────
export const HOST_MESSAGES = {
    HOST_NOT_FOUND : "Couldn't find this host user.",
    USER_NOT_A_HOST : "The user is not a host right now.",
    HOST_ALREADY_APPROVED : "Hosting application is already approved.",
    HOST_ALREADY_REJECTED : "Hosting application is already rejected.",
    HOST_ALREADY_BLOCKED : "Host user is already blocked.",
    HOST_APPLICATION_PENDING : "Your hosting application is already pending.",
    HOST_APPLY_SUCCESS : "Host upgrade application submitted successfully.",
    HOST_APPLY_FAILED : "Failed to submit host upgrade application.",
    HOST_APPROVE_SUCCESS : "Host application approved.",
    HOST_UPDATE_SUCCESS : "Host details has been updated.",
    HOST_UPDATE_FAILED : "Failed to update host details.",
    HOST_REJECT_SUCCESS : "Host application rejected.",
    HOST_BLOCKED : "Your hosting permissions are blocked by admin.",
    HOST_BLOCK_SUCCESS : "Host has been blocked.",
    HOST_UNBLOCK_SUCCESS : "Host has been unblocked.",
    SUCCESS_GET_HOSTS : "Hosts fetched successfully.",
    FAILED_GET_HOSTS : "Failed to fetch hosts.",
    CANNOT_CHANGE_HOST_ROLE : "Role modification is restricted for Host accounts.",
    CANNOT_CHANGE_HOST_DIRECTLY : "Direct role changes to Host are not permitted. Please use the Role Upgrade Portal.",
}



// ─── EVENT MANAGEMENT ───────────────────────────────────────────────────────
export const EVENT_MESSAGES = {
    EVENT_NOT_FOUND : "Coundn't find this event.",
    SUCCESS_CREATE_EVENT : "Event created successfully. Publish to make it live.",
    SUCCESS_UPDATE_EVENT : "Event has been updated.",
    SUCCESS_DELETE_EVENT : "Event has been deleted",
    SUCCESS_SUSPEND_EVENT : "Event has been suspended.",
    SUCCESS_PUBLISH_EVENT : "Event has been published.",
    FAILED_CREATE_EVENT : "Oops! We couldn’t create your event.",
    FAILED_UPDATE_EVENT : "Oops! We couldn’t update your event.",

    EVENT_ALREADY_STARTED : "Cannot modify booking after event has started",
    EVENT_ALREADY_ENDED : "Event has already ended",
    EVENT_ALREADY_CANCELLED : "This event is already cancelled",
    EVENT_ALREADY_SUSPENDED : "This event has been temporarily suspended",
}




// ─── BOOKING MANAGEMENT ───────────────────────────────────────────────────────
export const BOOKING_MESSAGES = {
    // Success
    BOOKING_INITIATED : "Booking initiated successfully",
    BOOKING_CONFIRMED : "Booking confirmed successfully",
    BOOKING_CANCELLED : "Booking has been cancelled.",

    // Online Event
    ONLINE_LIMIT_PER_USER : `You can only book ${ONLINE_MAX_TICKETS_PER_USER} ticket for online events`,
    ONLINE_LIMIT_EXCEEDED : "You already have an active booking for this online event",

    // Offline Event
    PER_BOOKING_LIMIT_EXCEEDED : `You cannot book more than ${OFFLINE_MAX_TICKETS_PER_BOOKING} tickets at a time.`,
    MIN_TICKETS_REQUIRED : `Minimum ${MIN_TICKETS_PER_BOOKING} ticket required`,

    // Availability
    EVENT_NOT_BOOKABLE : "This event is not available for booking",
    TICKETS_SOLD_OUT : "All tickets for this event have been sold out. Please check later.",
    WAITLIST_AVAILABLE : "No tickets left, but you can join the waitlist",

    // Booking Restrictions
    CANNOT_BOOK_OWN_EVENT : "You cannot book your own event.",
    ADMIN_CANNOT_BOOK : "Admins cannot book events",
    SUPER_ADMIN_CANNOT_BOOK : "Super admin cannot book events",

    // Cancellation
    BOOKING_ALREADY_CANCELLED : "This booking is already cancelled",
    CANCELLATION_WINDOW_CLOSED : "Cannot cancel booking. Cancellation window has already closed",
    CANCELLATION_NOT_ALLOWED : "This booking cannot be cancelled",
    UNAUTHORIZED_BOOKING_CANCELLATION : "You are not authorized to cancel this booking",
    CANNOT_CANCEL_AFTER_ENTRY : "Cannot cancel booking after entry pass has been used",

    // Errors
    BOOKING_NOT_FOUND : "Booking not found",
    BOOKING_ID_MISSING : "Booking ID is missing or not found",
    INVALID_TICKET_QUANTITY : "Invalid ticket quantity",
}


export const DYNAMIC_BOOKING_MESSAGES = {
    NOT_ENOUGH_TICKETS: (ticketsLeft: number): string =>
        `We are sorry, only ${ticketsLeft} ticket${ticketsLeft === 1 ? '' : 's'} left for this event.`,

    PER_USER_LIMIT_EXCEEDED: (bookedQty: number): string => {
        const remaining = OFFLINE_MAX_TICKETS_PER_USER - bookedQty;
        return bookedQty < OFFLINE_MAX_TICKETS_PER_USER
            ? `You’ve already booked ${bookedQty} of ${OFFLINE_MAX_TICKETS_PER_USER} tickets for this event. ${remaining} more ticket${remaining > 1 ? 's' : ''} allowed.`
            : `You’ve already booked ${bookedQty} of ${OFFLINE_MAX_TICKETS_PER_USER} tickets for this event. No more tickets allowed.`;
    },

    TICKET_FULLY_USED: (used: number, total: number): string =>
        `This ticket has already been used for ${used} of ${total} entries`,
} as const;



// ─── QR, TICKET & CHECK-IN MESSAGES ────────────────────────────────────────────────

export type CheckInErrorCode =
  | "INVALID_TOKEN"           // JWT verification failed / tampered
  | "WRONG_EVENT"             // token.eventId !== hostEventId
  | "BOOKING_NOT_FOUND"       // booking deleted or token stale
  | "BOOKING_NOT_CONFIRMED"   // status is pending / failed / cancelled
  | "QR_FULLY_USED"           // remainingEntries === 0
  | "ENTRY_EXCEEDS_REMAINING" // entryCount > remainingEntries
  | "OUTSIDE_TIME_WINDOW"     // scanned before start or after end
  | "EVENT_NOT_ACTIVE";       // event cancelled / suspended / completed




export const QR_TICKET_MESSAGES = {
    INVALID_TICKET : "Invalid ticket",
    QR_CODE_INVALID : "Invalid ticket or QR code",
    QR_CODE_EXPIRED : "QR code has expired",
    NO_TICKETS_REMAINING : "No tickets remaining for entry",
    CHECK_IN_SUCCESS : "Check-in successful",
    CHECK_IN_NOT_STARTED : "Check-in for this event hasn't started yet",
    CHECK_IN_CLOSED : "The event time is over and check-in has closed",
}

export const DYNAMIC_QR_TICKET_MESSAGES = {
    TICKET_FULLY_USED: (used: number, total: number) => 
    `This ticket has already been used for ${used} of ${total} entries`,
}




// ─── ADMIN & ROLE MANAGEMENT ────────────────────────────────────────────────
export const ADMIN_MESSAGES = {
    INVALID_USER_ROLE_CREATION : "Invalid role provided. Only 'user' or 'admin' roles can be created directly. Please use the Host Upgrade process to become a host.",
    INVALID_USER_STATUS_CREATION : "Invalid status. User status should only be pending for new users.",
    CANNOT_CHANGE_SUPER_ADMIN_ROLE : "Super Admin role cannot be changed.",
    ADMIN_CANNOT_CREATE_ADMIN : "Only Super Admin can create another Admin",
    ADMIN_CANNOT_EDIT_SELF : "You cannot edit your own account",
    ADMIN_CANNOT_EDIT_ADMIN : "Only Super Admin can edit another Admin",
    ADMIN_CANNOT_EDIT_SUPER_ADMIN : "Super Admin cannot be edited",
    ADMIN_CANNOT_BLOCK_SELF : "You cannot block your own account",
    ADMIN_CANNOT_BLOCK_ADMIN : "Only Super Admin can block another Admin",
    ADMIN_CANNOT_BLOCK_SUPER_ADMIN : "Super Admin cannot be blocked",
    ADMIN_CANNOT_DELETE_SELF : "You cannot delete your own account",
    ADMIN_CANNOT_DELETE_ADMIN : "Only Super Admin can delete another Admin",
    ADMIN_CANNOT_DELETE_SUPER_ADMIN : "Super Admin cannot be deleted",
}

// ─── PAYMENTS ────────────────────────────────────────────────────
export const WALLET_MESSAGES = {
    INSUFFICIENT_WALLET_BALANCE : "Insufficient wallet balance"
}


export const PAYMENT_MESSAGES = {
    // Payment system temporarily unavailable.
    // PAYMENT_SETUP_FAILED : "Couldn't load payment gateway. Try again later or contact support.",
    PAYMENT_SETUP_FAILED : "Unable to start payment. Try again later or contact support.",
    PAYMENT_GATEWAY_ERROR : "Payment gateway error. Please try again.",
    PAYMENT_VERIFICATION_FAILED : "Payment verification failed. If money was deducted, it will be refunded automatically.",
    PAYMENT_INITIATED : "Payment initiated",
    PAYMENT_VERIFIED : "Payment verified successfully",
    PAYMENT_FAILED : "Payment failed",
    PAYMENT_PENDING : "Payment is pending",
    PAYMENT_REFUNDED : "Payment refunded",
    REFUND_INITIATED : "Refund process started",
    RETRY_PAYMENT_PROCESSED : "Retry payment processed successfully",
    MINIMUM_AMOUNT_REQUIRED : "Minimum transaction amount must be at least ₹1.00.",
    INVALID_PAYMENT_SIGNATURE : "Payment verification failed — invalid signature",
    INVALID_PAYMENT_METHOD : "Invalid payment method selected.",
    INVALID_ID_MISSING : "Payment ID is missing or not found.",
    PAYMENT_AMOUNT_MISMATCH : "Payment amount does not match ...booking... amount",  // booking ??
    MAX_RETRIES_EXCEEDED : "Maximum payment retry attempts exceeded",
}




export const PAYOUT_MESSAGES = {
   PAYOUT_REQUEST_SUBMITTED : "Payout request submitted successfully",
   PAYOUT_APPROVED          : "Payout approved and credited to host wallet",
   PAYOUT_REJECTED          : "Payout request rejected",
   PAYOUT_NOT_FOUND         : "Payout request not found",
   PAYOUT_ALREADY_REQUESTED : "A payout has already been requested for this event",
   PAYOUT_ALREADY_REVIEWED  : "This payout has already been reviewed",
   NOT_EVENT_HOST           : "You are not the host of this event",
   EVENT_NOT_COMPLETED      : "Payout can only be requested for completed events",
   NO_REVENUE               : "This event has no ticket revenue to pay out",
   REJECTION_REASON_REQUIRED: "A rejection reason is required",
};
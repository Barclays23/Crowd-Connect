// backend/src/types/notification.types.ts

import { NotificationEntity } from "@/entities/notification.entity";
import { EmailTemplate } from "@/types/email.types";



export enum NOTIFICATION_TYPES {
    // ── Auth & Account ────────────────────────────────────────────
    ACCOUNT_CREATED_BY_ADMIN       = "ACCOUNT_CREATED_BY_ADMIN",
    ACCOUNT_BLOCKED                = "ACCOUNT_BLOCKED",
    ACCOUNT_UNBLOCKED              = "ACCOUNT_UNBLOCKED",
    ACCOUNT_SUSPENDED              = "ACCOUNT_SUSPENDED",
    ACCOUNT_REACTIVATED            = "ACCOUNT_REACTIVATED",

    PASSWORD_CHANGED               = "PASSWORD_CHANGED",
    PASSWORD_RESET_COMPLETED       = "PASSWORD_RESET_COMPLETED",
    EMAIL_VERIFICATION             = "EMAIL_VERIFICATION",


    // ── Host Application → to Host ───────────────────────────────────────────────────
    HOST_REQUEST_SUBMITTED = "HOST_REQUEST_SUBMITTED",
    HOST_REQUEST_APPROVED = "HOST_REQUEST_APPROVED",
    HOST_REQUEST_REJECTED = "HOST_REQUEST_REJECTED",

    // ── Host Application → to Admin ───────────────────────────────────────────────────
    HOST_REQUEST_RECEIVED = "HOST_REQUEST_RECEIVED",



    // ── Booking ───────────────────────────────────────────────────
    BOOKING_CONFIRMED              = "BOOKING_CONFIRMED",
    BOOKING_PAYMENT_FAILED         = "BOOKING_PAYMENT_FAILED",
    BOOKING_CANCELLED_BY_USER      = "BOOKING_CANCELLED_BY_USER",
    BOOKING_CANCELLED_BY_AUTHORITY = "BOOKING_CANCELLED_BY_AUTHORITY",
    BOOKING_REFUND_PROCESSED       = "BOOKING_REFUND_PROCESSED",


    // ── Event → Attendees ─────────────────────────────────────────
    EVENT_CANCELLED                = "EVENT_CANCELLED",
    EVENT_SUSPENDED                = "EVENT_SUSPENDED",
    EVENT_MAJOR_CHANGE             = "EVENT_MAJOR_CHANGE",   // date/venue/time change -> grace period
    EVENT_REMINDER                 = "EVENT_REMINDER",



    // ── Event → Host ──────────────────────────────────────────────
    EVENT_SUSPENDED_HOST           = "EVENT_SUSPENDED_HOST",
    EVENT_UPDATED_BY_ADMIN         = "EVENT_UPDATED_BY_ADMIN",
    EVENT_DELETED_BY_ADMIN         = "EVENT_DELETED_BY_ADMIN",
    EVENT_PUBLISHED                = "EVENT_PUBLISHED",


    // ── Payout → Host ─────────────────────────────────────────────
    PAYOUT_REQUESTED               = "PAYOUT_REQUESTED", // to admin and host
    PAYOUT_REJECTED                = "PAYOUT_REJECTED",
    PAYOUT_APPROVED                = "PAYOUT_APPROVED",
    PAYOUT_PAID                    = "PAYOUT_PAID",


    // ── Payout → Admin ────────────────────────────────────────────
    PAYOUT_REQUEST_RECEIVED  = "PAYOUT_REQUEST_RECEIVED",


    // ── Referral & Cashback → User ────────────────────────────────────────────
    REFERRAL_CREDIT                = "REFERRAL_CREDIT",
    CASHBACK_RECEIVED              = "CASHBACK_RECEIVED",


    // ── Review → Host ────────────────────────────────────────────
    // REVIEW_AVAILABLE                = "REVIEW_AVAILABLE",
    NEW_REVIEW_RECEIVED             = "NEW_REVIEW_RECEIVED",

}


export enum RELATED_ENTITY_TYPE {
    BOOKING = "booking",
    EVENT   = "event",
    PAYOUT  = "payout",
    USER    = "user"
}


export enum NOTIFICATION_CHANNEL_TYPES {
    IN_APP    = "IN_APP",
    EMAIL     = "EMAIL",
    SMS       = "SMS",       // Phase 2
    WHATSAPP  = "WHATSAPP",  // Phase 2
    PUSH      = "PUSH",      // Phase 2 / later
}



export enum NOTIFICATION_RECIPIENT_ROLES {
    USER  = "user",
    HOST  = "host",
    ADMIN = "admin",
}


export interface NotificationRecipient {
    userId: string;
    role: NOTIFICATION_RECIPIENT_ROLES;
    name?: string; 
    email?: string;
    mobile?: string;          // ready for SMS/WhatsApp later
    deviceTokens?: string[];  // ready for push later
}



export interface NotifyRequest {
    type: NOTIFICATION_TYPES;
    recipient: NotificationRecipient;
    data: Record<string, unknown>;   // template variables, e.g. { eventTitle, ticketNo }
    relatedEntity?: {
        entityType: RELATED_ENTITY_TYPE;
        entityId: string;
    };
    // Escape hatch: force specific channels for this one call, bypassing the matrix
    channelsOverride?: NOTIFICATION_CHANNEL_TYPES[];
}




// What the content builder produces. `emailTemplate` + `emailTemplatePayload` point at a
// real Handlebars file (see @/types/email.types EmailTemplate); `emailText` is the plaintext
// fallback used both as the email's text/plain part and as a safety net if no template is set.
export interface NotificationContent {
    title: string;             // short label, used for in-app + push
    inAppMessage: string;
    emailSubject?: string;
    emailTemplate?: EmailTemplate;
    emailTemplatePayload?: Record<string, unknown>;
    emailText?: string;
    smsText?: string;          // Phase 2
    whatsappText?: string;     // Phase 2
}


// What an individual channel implementation actually receives to do its job
export interface ChannelDispatchPayload {
    recipient: NotificationRecipient;
    type: NOTIFICATION_TYPES;
    content: NotificationContent;
    relatedEntity?: NotifyRequest["relatedEntity"];
}



// Repository returns raw counts, NOT IPagination
export interface GetNotificationsResult {
    notifications: NotificationEntity[];
    totalCount: number;
    unreadCount: number;
}
// src/services/notification-services/implementations/NotificationChannelMatrix.ts
import { INotificationChannelMatrix } from "@/services/notification-services/interfaces/INotificationChannelMatrix";
import { 
    NOTIFICATION_TYPES, 
    NOTIFICATION_CHANNEL_TYPES 
} from "@/types/notification.types";



const { IN_APP, EMAIL, SMS, WHATSAPP, PUSH } = NOTIFICATION_CHANNEL_TYPES;


// Single source of truth for "which channels does each notification type use".
// Adding SMS/WhatsApp tomorrow = add the channel to the relevant array(s) below.
// NotificationService itself never changes (Open/Closed in practice).
const CHANNEL_MATRIX: Partial<Record<NOTIFICATION_TYPES, NOTIFICATION_CHANNEL_TYPES[]>> = {
    [NOTIFICATION_TYPES.ACCOUNT_CREATED_BY_ADMIN]       : [IN_APP, EMAIL],
    [NOTIFICATION_TYPES.ACCOUNT_BLOCKED]                : [IN_APP, EMAIL],
    [NOTIFICATION_TYPES.ACCOUNT_UNBLOCKED]              : [IN_APP, EMAIL],
    [NOTIFICATION_TYPES.PASSWORD_CHANGED]               : [EMAIL],
    [NOTIFICATION_TYPES.PASSWORD_RESET_COMPLETED]       : [EMAIL],

    [NOTIFICATION_TYPES.BOOKING_CONFIRMED]              : [IN_APP, EMAIL],
    [NOTIFICATION_TYPES.BOOKING_PAYMENT_FAILED]         : [IN_APP],
    [NOTIFICATION_TYPES.BOOKING_CANCELLED_BY_USER]      : [IN_APP, EMAIL],
    [NOTIFICATION_TYPES.BOOKING_CANCELLED_BY_AUTHORITY] : [IN_APP, EMAIL],
    [NOTIFICATION_TYPES.BOOKING_REFUND_PROCESSED]       : [IN_APP, EMAIL],

    [NOTIFICATION_TYPES.EVENT_CANCELLED]                : [IN_APP, EMAIL],
    [NOTIFICATION_TYPES.EVENT_SUSPENDED]                : [IN_APP, EMAIL],
    [NOTIFICATION_TYPES.EVENT_MAJOR_CHANGE]             : [IN_APP, EMAIL],
    [NOTIFICATION_TYPES.EVENT_REMINDER]                 : [IN_APP],

    [NOTIFICATION_TYPES.EVENT_SUSPENDED_HOST]           : [IN_APP, EMAIL],
    [NOTIFICATION_TYPES.EVENT_UPDATED_BY_ADMIN]         : [IN_APP, EMAIL],
    [NOTIFICATION_TYPES.EVENT_DELETED_BY_ADMIN]         : [IN_APP, EMAIL],
    [NOTIFICATION_TYPES.EVENT_PUBLISHED]                : [IN_APP],

    [NOTIFICATION_TYPES.PAYOUT_REQUESTED]               : [IN_APP],
    [NOTIFICATION_TYPES.PAYOUT_APPROVED]                : [IN_APP, EMAIL],
    [NOTIFICATION_TYPES.PAYOUT_REJECTED]                : [IN_APP, EMAIL],

    [NOTIFICATION_TYPES.PAYOUT_REQUEST_RECEIVED]        : [IN_APP],
};



export class NotificationChannelMatrix implements INotificationChannelMatrix {
    getChannelsFor(type: NOTIFICATION_TYPES): NOTIFICATION_CHANNEL_TYPES[] {
        return CHANNEL_MATRIX[type] ?? [IN_APP];
    }
}
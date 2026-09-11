// src/services/notification-services/implementations/NotificationContentProvider.ts
import { INotificationContentProvider } from "@/services/notification-services/interfaces/INotificationContentProvider";
import { 
    NOTIFICATION_TYPES, 
    NotificationContent, 
    NotificationRecipient 
} from "@/types/notification.types";
import { 
    EmailTemplate, 
    NotificationGenericPayload 
} from "@/types/email.types";





// Every builder receives the recipient (for USER_NAME) and the call-site's data bag,
// and must return a fully-typed NotificationContent - no inferred/implicit shape.
type ContentBuilder = (recipient: NotificationRecipient, data: Record<string, unknown>) => NotificationContent;


// Wires the generic template + payload so individual builders don't repeat this boilerplate.
// Swap a specific type to its own dedicated template later just by not using this helper.
function genericEmail(
    recipient: NotificationRecipient,
    heading: string,
    bodyHtml: string,
    cta?: { text: string; link: string }
): Pick<NotificationContent, "emailTemplate" | "emailTemplatePayload"> {
    const payload: NotificationGenericPayload = {
        USER_NAME:    recipient.name ?? "there",
        HEADING:      heading,
        BODY_HTML:    bodyHtml,
        CTA_TEXT:     cta?.text,
        CTA_LINK:     cta?.link,
        CURRENT_YEAR: new Date().getFullYear(),
    };

    return { 
        emailTemplate: EmailTemplate.NOTIFICATION_GENERIC, 
        emailTemplatePayload: payload 
    };
}



// One builder per NOTIFICATION_TYPES. Adding a new type = adding one entry here;
// existing builders are never touched (Open/Closed).
const CONTENT_BUILDERS: Partial<Record<NOTIFICATION_TYPES, ContentBuilder>> = {

    // ── Auth & Account ────────────────────────────────────────────
    [NOTIFICATION_TYPES.ACCOUNT_CREATED_BY_ADMIN]: (recipient): NotificationContent => ({
        title:        "Welcome to CrowdConnect",
        inAppMessage: "Your account has been created by an admin. Use 'Forgot password' on the login page to set your password.",
        emailSubject: "Your CrowdConnect account is ready",
        emailText:    "An admin created a CrowdConnect account for you. Use 'Forgot password' on the login page to set your password.",
        smsText:      "Your CrowdConnect account is ready. Use 'Forgot password' on the login page to set your password.",
        whatsappText: "Your CrowdConnect account is ready. Use 'Forgot password' on the login page to set your password.",
        ...genericEmail(recipient, "Your account is ready",
            "<p>An admin has created an account for you on CrowdConnect.</p>" +
            "<p>To get started, use the <strong>Forgot Password</strong> option on the login page to set your own password.</p>"),
    }),

    [NOTIFICATION_TYPES.ACCOUNT_BLOCKED]: (recipient, data): NotificationContent => {
        const { reason } = data as { reason?: string };
        const reasonLine = reason ? ` Reason: ${reason}` : "";
        return {
            title:        "Account blocked",
            inAppMessage: `Your account has been blocked.${reasonLine} Contact support if you think this is a mistake.`,
            emailSubject: "Your CrowdConnect account has been blocked",
            emailText:    `Your account has been blocked.${reasonLine}`,
            smsText:      `Your CrowdConnect account has been blocked.${reasonLine}`,
            whatsappText: `Your CrowdConnect account has been blocked.${reasonLine}`,
            ...genericEmail(recipient, "Your account has been blocked",
                `<p>Your CrowdConnect account has been blocked.${reasonLine}</p><p>Contact support if you think this is a mistake.</p>`),
        };
    },

    [NOTIFICATION_TYPES.ACCOUNT_UNBLOCKED]: (recipient): NotificationContent => ({
        title:        "Account restored",
        inAppMessage: "Your account has been unblocked. You can log in again.",
        emailSubject: "Your CrowdConnect account has been restored",
        emailText:    "Your account has been unblocked. You can log in again.",
        smsText:      "Your CrowdConnect account has been restored. You can log in again.",
        whatsappText: "Your CrowdConnect account has been restored. You can log in again.",
        ...genericEmail(recipient, "Your account has been restored", "<p>Your account has been unblocked. You can log in again.</p>"),
    }),

    [NOTIFICATION_TYPES.ACCOUNT_SUSPENDED]: (recipient, data): NotificationContent => {
        const { reason } = data as { reason?: string };
        const reasonLine = reason ? ` Reason: ${reason}` : "";
        return {
            title:        "Account suspended",
            inAppMessage: `Your account has been temporarily suspended.${reasonLine}`,
            emailSubject: "Your CrowdConnect account has been suspended",
            emailText:    `Your account has been temporarily suspended.${reasonLine}`,
            smsText:      `Your CrowdConnect account has been suspended.${reasonLine}`,
            whatsappText: `Your CrowdConnect account has been suspended.${reasonLine}`,
            ...genericEmail(recipient, "Your account has been suspended",
                `<p>Your CrowdConnect account has been temporarily suspended.${reasonLine}</p>`),
        };
    },

    [NOTIFICATION_TYPES.ACCOUNT_REACTIVATED]: (recipient): NotificationContent => ({
        title:        "Account reactivated",
        inAppMessage: "Your account has been reactivated.",
        emailSubject: "Your CrowdConnect account is active again",
        emailText:    "Your account has been reactivated.",
        smsText:      "Your CrowdConnect account has been reactivated.",
        whatsappText: "Your CrowdConnect account has been reactivated.",
        ...genericEmail(recipient, "Your account is active again", "<p>Your CrowdConnect account has been reactivated.</p>"),
    }),

    [NOTIFICATION_TYPES.PASSWORD_CHANGED]: (recipient): NotificationContent => ({
        title:        "Password changed",
        inAppMessage: "Your password was changed.",
        emailSubject: "Your CrowdConnect password was changed",
        emailText:    "Your password was just changed. If this wasn't you, contact support immediately.",
        ...genericEmail(recipient, "Your password was changed",
            "<p>Your password was just changed.</p><p>If this wasn't you, contact support immediately.</p>"),
    }),

    [NOTIFICATION_TYPES.PASSWORD_RESET_COMPLETED]: (recipient): NotificationContent => ({
        title:        "Password reset",
        inAppMessage: "Your password was reset.",
        emailSubject: "Your CrowdConnect password was reset",
        emailText:    "Your password was just reset. If this wasn't you, contact support immediately.",
        ...genericEmail(recipient, "Your password was reset",
            "<p>Your password was just reset.</p><p>If this wasn't you, contact support immediately.</p>"),
    }),

    [NOTIFICATION_TYPES.EMAIL_VERIFICATION]: (): NotificationContent => ({
        title:        "Email verified",
        inAppMessage: "Your email address has been verified.",
    }),

    // ── Host Application ──────────────────────────────────────────
    [NOTIFICATION_TYPES.HOST_REQUEST_SUBMITTED]: (recipient): NotificationContent => ({
        title:        "Host application submitted",
        inAppMessage: "Your host application has been submitted for review.",
        emailSubject: "We've received your host application",
        emailText:    "Your host application has been submitted and is under review.",
        ...genericEmail(recipient, "Application received", "<p>Your host application has been submitted and is under review.</p>"),
    }),
    [NOTIFICATION_TYPES.HOST_REQUEST_RECEIVED]: (recipient): NotificationContent => ({
        title:        "Host application received",
        inAppMessage: "A new host application has been received for review.",
        emailSubject: "A new host application has been received",
        emailText:    "A host application has been received and is under review.",
        ...genericEmail(recipient, "Application received", "<p>A new host application has been received and is under review.</p>"),
    }),

    [NOTIFICATION_TYPES.HOST_REQUEST_APPROVED]: (recipient): NotificationContent => ({
        title:        "Host application approved",
        inAppMessage: "Congratulations! Your host application has been approved.",
        emailSubject: "You're now a CrowdConnect host!",
        emailText:    "Your host application has been approved. You can now create events.",
        smsText:      "Your CrowdConnect host application was approved! You can now create events.",
        whatsappText: "Your CrowdConnect host application was approved! You can now create events.",
        ...genericEmail(recipient, "You're approved!", "<p>Your host application has been approved. You can now create events.</p>"),
    }),

    [NOTIFICATION_TYPES.HOST_REQUEST_REJECTED]: (recipient, data): NotificationContent => {
        const { reason } = data as { reason?: string };
        const reasonLine = reason ? ` Reason: ${reason}` : "";
        return {
            title:        "Host application rejected",
            inAppMessage: `Your host application was not approved.${reasonLine}`,
            emailSubject: "Update on your host application",
            emailText:    `Your host application was not approved.${reasonLine}`,
            ...genericEmail(recipient, "Application update", `<p>Your host application was not approved.${reasonLine}</p>`),
        };
    },

    // ── Booking ───────────────────────────────────────────────────
    [NOTIFICATION_TYPES.BOOKING_CONFIRMED]: (recipient, data): NotificationContent => {
        const { eventTitle, ticketNo, quantity } = data as { eventTitle: string; ticketNo: string; quantity: number };
        return {
            title:        "Booking confirmed",
            inAppMessage: `Your booking for "${eventTitle}" is confirmed. Ticket No: ${ticketNo} (${quantity} ticket(s)).`,
            emailSubject: `Your ticket for ${eventTitle} is confirmed`,
            emailText:    `Your booking for ${eventTitle} is confirmed. Ticket No: ${ticketNo}.`,
            smsText:      `CrowdConnect: Booking confirmed for ${eventTitle}. Ticket No: ${ticketNo}.`,
            whatsappText: `Your booking for *${eventTitle}* is confirmed. Ticket No: ${ticketNo} (${quantity} ticket(s)).`,
            ...genericEmail(recipient, "Your booking is confirmed",
                `<p>Your booking for <strong>${eventTitle}</strong> is confirmed.</p><p>Ticket No: ${ticketNo} (${quantity} ticket(s))</p>`),
        };
    },

    [NOTIFICATION_TYPES.BOOKING_PAYMENT_FAILED]: (recipient, data): NotificationContent => {
        const { eventTitle } = data as { eventTitle: string };
        return {
            title:        "Payment failed",
            inAppMessage: `Your payment for "${eventTitle}" could not be completed. Retry from your bookings page.`,
            smsText:      `CrowdConnect: Payment failed for ${eventTitle}. Please retry from the app.`,
            whatsappText: `Your payment for *${eventTitle}* could not be completed. Please retry from the app.`,
            ...genericEmail(recipient, "Payment could not be completed",
                `<p>Your payment for <strong>${eventTitle}</strong> could not be completed.</p><p>You can retry from your bookings page.</p>`),
        };
    },

    [NOTIFICATION_TYPES.BOOKING_CANCELLED_BY_USER]: (recipient, data): NotificationContent => {
        const { eventTitle, refundAmount } = data as { eventTitle: string; refundAmount: number };
        const refundLine = refundAmount > 0 ? ` ₹${refundAmount} will be refunded.` : "";
        return {
            title:        "Booking cancelled",
            inAppMessage: `Your booking for "${eventTitle}" was cancelled.${refundLine}`,
            emailSubject: `Your booking for ${eventTitle} has been cancelled`,
            emailText:    `Your booking for ${eventTitle} has been cancelled.${refundLine}`,
            smsText:      `CrowdConnect: Your booking for ${eventTitle} was cancelled.${refundLine}`,
            whatsappText: `Your booking for *${eventTitle}* has been cancelled.${refundLine}`,
            ...genericEmail(recipient, "Booking cancelled",
                `<p>Your booking for <strong>${eventTitle}</strong> has been cancelled as requested.</p>` +
                (refundAmount > 0 ? `<p>₹${refundAmount} will be refunded to your wallet.</p>` : "")),
        };
    },

    [NOTIFICATION_TYPES.BOOKING_CANCELLED_BY_AUTHORITY]: (recipient, data): NotificationContent => {
        const { eventTitle, cancelReason, refundAmount } = data as { eventTitle: string; cancelReason: string; refundAmount: number };
        const refundLine = refundAmount > 0 ? " Your refund is being processed." : "";
        return {
            title:        "Booking cancelled",
            inAppMessage: `Your booking for "${eventTitle}" was cancelled. Reason: ${cancelReason}.${refundLine}`,
            emailSubject: `Your booking for ${eventTitle} was cancelled`,
            emailText:    `Your booking for ${eventTitle} was cancelled. Reason: ${cancelReason}.${refundLine}`,
            smsText:      `CrowdConnect: Your booking for ${eventTitle} was cancelled. ${cancelReason}`,
            whatsappText: `Your booking for *${eventTitle}* was cancelled.\nReason: ${cancelReason}${refundLine}`,
            ...genericEmail(recipient, "Booking cancelled",
                `<p>Your booking for <strong>${eventTitle}</strong> was cancelled.</p><p>Reason: ${cancelReason}</p>` +
                (refundAmount > 0 ? "<p>Your refund is being processed.</p>" : "")),
        };
    },

    [NOTIFICATION_TYPES.BOOKING_REFUND_PROCESSED]: (recipient, data): NotificationContent => {
        const { eventTitle, refundAmount } = data as { eventTitle: string; refundAmount: number };
        return {
            title:        "Refund processed",
            inAppMessage: `₹${refundAmount} has been refunded to your wallet for "${eventTitle}".`,
            emailSubject: `Your refund for ${eventTitle} has been processed`,
            emailText:    `₹${refundAmount} has been refunded to your wallet for ${eventTitle}.`,
            smsText:      `CrowdConnect: ₹${refundAmount} refunded to your wallet for ${eventTitle}.`,
            whatsappText: `₹${refundAmount} has been refunded to your wallet for *${eventTitle}*.`,
            ...genericEmail(recipient, "Refund processed", `<p>₹${refundAmount} has been refunded to your wallet for <strong>${eventTitle}</strong>.</p>`),
        };
    },

    // ── Event → Attendees ─────────────────────────────────────────
    // NOTE: EVENT_CANCELLED / EVENT_SUSPENDED aren't triggered by any code path today -
    // BOOKING_CANCELLED_BY_AUTHORITY already covers attendees via the booking-cancellation
    // cascade. These are here for a future use case (e.g. notifying users who wishlisted
    // an event but never booked it).
    [NOTIFICATION_TYPES.EVENT_CANCELLED]: (recipient, data): NotificationContent => {
        const { eventTitle, cancelReason } = data as { eventTitle: string; cancelReason: string };
        return {
            title:        "Event cancelled",
            inAppMessage: `"${eventTitle}" has been cancelled. ${cancelReason}`,
            emailSubject: `${eventTitle} has been cancelled`,
            emailText:    `${eventTitle} has been cancelled. ${cancelReason}`,
            smsText:      `CrowdConnect: ${eventTitle} has been cancelled.`,
            whatsappText: `*${eventTitle}* has been cancelled.\n${cancelReason}`,
            ...genericEmail(recipient, "Event cancelled", `<p><strong>${eventTitle}</strong> has been cancelled.</p><p>${cancelReason}</p>`),
        };
    },

    [NOTIFICATION_TYPES.EVENT_SUSPENDED]: (recipient, data): NotificationContent => {
        const { eventTitle, suspendReason } = data as { eventTitle: string; suspendReason: string };
        return {
            title:        "Event suspended",
            inAppMessage: `"${eventTitle}" has been suspended. ${suspendReason}`,
            emailSubject: `${eventTitle} has been suspended`,
            emailText:    `${eventTitle} has been suspended. ${suspendReason}`,
            smsText:      `CrowdConnect: ${eventTitle} has been suspended.`,
            whatsappText: `*${eventTitle}* has been suspended.\n${suspendReason}`,
            ...genericEmail(recipient, "Event suspended", `<p><strong>${eventTitle}</strong> has been suspended.</p><p>${suspendReason}</p>`),
        };
    },

    [NOTIFICATION_TYPES.EVENT_MAJOR_CHANGE]: (recipient, data): NotificationContent => {
        const { eventTitle, summary, gracePeriodEnd } = data as { eventTitle: string; summary: string; gracePeriodEnd: Date };
        const deadline = new Date(gracePeriodEnd).toLocaleString();
        return {
            title:        "Event details changed",
            inAppMessage: `"${eventTitle}" has changed: ${summary}. You can cancel for a full refund until ${deadline}.`,
            emailSubject: `Important update about ${eventTitle}`,
            emailText:    `${eventTitle} has changed: ${summary}. You can cancel for a full refund until ${deadline}.`,
            smsText:      `CrowdConnect: ${eventTitle} changed - ${summary}. Free cancellation until ${deadline}.`,
            whatsappText: `*${eventTitle}* has changed:\n${summary}\n\nYou can cancel for a full refund until ${deadline}.`,
            ...genericEmail(recipient, "Something changed about this event",
                `<p><strong>${eventTitle}</strong> has changed: ${summary}</p>` +
                `<p>You can cancel for a full refund until <strong>${deadline}</strong>.</p>`),
        };
    },

    [NOTIFICATION_TYPES.EVENT_REMINDER]: (recipient, data): NotificationContent => {
        const { eventTitle } = data as { eventTitle: string };
        return {
            title:        "Event reminder",
            inAppMessage: `"${eventTitle}" is coming up soon.`,
            smsText:      `CrowdConnect: Reminder - ${eventTitle} is coming up soon.`,
            whatsappText: `Reminder: *${eventTitle}* is coming up soon.`,
            ...genericEmail(recipient, "Your event is coming up", `<p><strong>${eventTitle}</strong> is coming up soon.</p>`),
        };
    },

    // ── Event → Host ──────────────────────────────────────────────
    [NOTIFICATION_TYPES.EVENT_SUSPENDED_HOST]: (recipient, data): NotificationContent => {
        const { eventTitle, suspendReason } = data as { eventTitle: string; suspendReason: string };
        return {
            title:        "Event suspended",
            inAppMessage: `Your event "${eventTitle}" was suspended by an admin. Reason: ${suspendReason}`,
            emailSubject: `Your event "${eventTitle}" has been suspended`,
            emailText:    `Your event ${eventTitle} was suspended by an admin. Reason: ${suspendReason}`,
            smsText:      `CrowdConnect: Your event ${eventTitle} was suspended. ${suspendReason}`,
            whatsappText: `Your event *${eventTitle}* was suspended by an admin.\nReason: ${suspendReason}`,
            ...genericEmail(recipient, "Your event has been suspended",
                `<p>Your event <strong>${eventTitle}</strong> was suspended by an admin.</p><p>Reason: ${suspendReason}</p>`),
        };
    },

    // ── Payout ────────────────────────────────────────────────────
    [NOTIFICATION_TYPES.PAYOUT_REQUESTED]: (recipient, data): NotificationContent => {
        const { eventTitle } = data as { eventTitle: string };
        return {
            title:        "Payout requested",
            inAppMessage: `Your payout request for "${eventTitle}" has been submitted.`,
            emailSubject: `Payout request received - ${eventTitle}`,
            emailText:    `Your payout request for ${eventTitle} has been submitted.`,
            ...genericEmail(recipient, "Payout request received", `<p>Your payout request for <strong>${eventTitle}</strong> has been submitted.</p>`),
        };
    },

    [NOTIFICATION_TYPES.PAYOUT_REJECTED]: (recipient, data): NotificationContent => {
        const { eventTitle, rejectionReason } = data as { eventTitle: string; rejectionReason: string };
        return {
            title:        "Payout request rejected",
            inAppMessage: `Your payout request for "${eventTitle}" was rejected. Reason: ${rejectionReason}`,
            emailSubject: `Payout request rejected — ${eventTitle}`,
            emailText:    `Your payout request for ${eventTitle} was rejected. Reason: ${rejectionReason}`,
            smsText:      `CrowdConnect: Payout request for ${eventTitle} was rejected.`,
            whatsappText: `Your payout request for *${eventTitle}* was rejected.\nReason: ${rejectionReason}`,
            ...genericEmail(recipient, "Payout request rejected",
                `<p>Your payout request for <strong>${eventTitle}</strong> was rejected.</p><p>Reason: ${rejectionReason}</p>`),
        };
    },

    // NOTE: your current PayoutService.reviewPayout "approve" branch transfers funds and
    // marks the payout PAID in one step - so today, fire PAYOUT_PAID from that branch.
    // PAYOUT_APPROVED is here ready for if you split that into an approve-then-pay flow later.
    [NOTIFICATION_TYPES.PAYOUT_APPROVED]: (recipient, data): NotificationContent => {
        const { eventTitle } = data as { eventTitle: string };
        return {
            title:        "Payout approved",
            inAppMessage: `Your payout request for "${eventTitle}" has been approved and is being processed.`,
            emailSubject: `Payout approved — ${eventTitle}`,
            emailText:    `Your payout request for ${eventTitle} has been approved and is being processed.`,
            ...genericEmail(recipient, "Payout approved", `<p>Your payout request for <strong>${eventTitle}</strong> has been approved and is being processed.</p>`),
        };
    },

    [NOTIFICATION_TYPES.PAYOUT_PAID]: (recipient, data): NotificationContent => {
        const { eventTitle, netAmount } = data as { eventTitle: string; netAmount: number };
        return {
            title:        "Payout paid",
            inAppMessage: `Your payout of ₹${netAmount} for "${eventTitle}" has been paid.`,
            emailSubject: `Payout paid — ${eventTitle}`,
            emailText:    `Your payout of ₹${netAmount} for ${eventTitle} has been paid.`,
            smsText:      `CrowdConnect: ₹${netAmount} payout for ${eventTitle} has been paid.`,
            whatsappText: `Your payout of ₹${netAmount} for *${eventTitle}* has been paid.`,
            ...genericEmail(recipient, "Payout paid", `<p>Your payout of <strong>₹${netAmount}</strong> for <strong>${eventTitle}</strong> has been paid.</p>`),
        };
    },

    [NOTIFICATION_TYPES.PAYOUT_REQUEST_RECEIVED]: (recipient, data): NotificationContent => {
        const { eventTitle, hostName } = data as { eventTitle: string; hostName?: string };
        const hostLine = hostName ? ` from ${hostName}` : "";
        return {
            title:        "New payout request",
            inAppMessage: `A new payout request for "${eventTitle}"${hostLine} needs review.`,
        };
    },

    // ── Referral & Cashback ───────────────────────────────────────
    [NOTIFICATION_TYPES.REFERRAL_CREDIT]: (recipient, data): NotificationContent => {
        const { amount } = data as { amount: number };
        return {
            title:        "Referral credit earned",
            inAppMessage: `You earned ₹${amount} in referral credit.`,
        };
    },

    [NOTIFICATION_TYPES.CASHBACK_RECEIVED]: (recipient, data): NotificationContent => {
        const { amount, eventTitle } = data as { amount: number; eventTitle?: string };
        const eventLine = eventTitle ? ` for ${eventTitle}` : "";
        return {
            title:        "Cashback received",
            inAppMessage: `You received ₹${amount} cashback${eventLine}.`,
            emailSubject: "You received cashback",
            emailText:    `You received ₹${amount} cashback${eventLine}.`,
            ...genericEmail(recipient, "You received cashback", `<p>You received <strong>₹${amount}</strong> cashback${eventLine}.</p>`),
        };
    },

    // ── Review ────────────────────────────────────────────────────
    [NOTIFICATION_TYPES.NEW_REVIEW_RECEIVED]: (recipient, data): NotificationContent => {
        const { eventTitle } = data as { eventTitle: string };
        return {
            title:        "New review received",
            inAppMessage: `Your event "${eventTitle}" received a new review.`,
        };
    },
};






export class NotificationContentProvider implements INotificationContentProvider {
    buildNotificationContent(
        type: NOTIFICATION_TYPES,
        recipient: NotificationRecipient,
        data: Record<string, unknown>
    ): NotificationContent {
        const builder: ContentBuilder | undefined = CONTENT_BUILDERS[type];
        console.log('notification content builder :', builder);

        if (!builder) {
            // Fail-safe generic content so a missing builder never crashes a business flow.
            console.warn(`[NotificationContentProvider] No content builder registered for type: ${type}`);
            return { title: "Notification", inAppMessage: "You have a new update." };
        }

        // if (!builder) {
        //     throw createHttpError(
        //         HTTP_STATUS.INTERNAL_SERVER_ERROR,
        //         `No content builder registered for notification type "${type}"`
        //     );
        // }

        return builder(recipient, data);
    }
}
// backend/src/utils/templates/bookingTicketEmail.template.ts
import { 
    NotificationRecipient, 
    BookingConfirmedNotificationData 
} from "@/types/notification.types";



export const generateBookingTicketHtml = (recipient: NotificationRecipient, data: BookingConfirmedNotificationData): string => {
    const { 
        eventTitle, 
        ticketNo, 
        quantity, 
        qrToken, 
        format, 
        totalAmount,
        posterUrl,
        startDateTime,
        endDateTime
    } = data;

    const qrImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrToken)}&size=160&margin=1`;
    const isFree = totalAmount === 0;
    const priceDisplay = isFree ? "FREE" : `₹${(totalAmount || 0).toLocaleString("en-IN")}`;
    
    // Formatting dates if they exist (assuming ISO strings)
    const startDateFormatted = startDateTime ? new Date(startDateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'TBA';
    const endDateFormatted = endDateTime ? new Date(endDateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'TBA';

    return `
        <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; font-family: 'Inter', Arial, sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            
            <!-- Header Strip (Brand Primary: Coral Red) -->
            <div style="background-color: #ff6b6b; padding: 16px 20px; color: #ffffff; text-align: justify;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td>
                            <h3 style="margin: 0; font-size: 18px; letter-spacing: 1px; text-transform: uppercase;">Entry Pass</h3>
                        </td>
                        <td align="right">
                            <p style="margin: 0; font-size: 14px; font-weight: bold;">#${ticketNo}</p>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Event Poster -->
            ${posterUrl ? `
                <div style="width: 100%; max-height: 250px; overflow: hidden; background-color: #eeeeee;">
                    <img src="${posterUrl}" alt="${eventTitle}" style="width: 100%; height: auto; display: block; object-fit: cover;" />
                </div>
            ` : ''}

            <!-- Body -->
            <div style="padding: 24px;">
                <!-- Attendee & Price -->
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px;">
                    <tr>
                        <td valign="top">
                            <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #6b7280; letter-spacing: 1px;">Attendee</p>
                            <h2 style="margin: 4px 0 0 0; font-size: 24px; color: #111827;">${recipient.name || "Guest"}</h2>
                        </td>
                        <td valign="top" align="right">
                            <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #6b7280; letter-spacing: 1px;">Total Price</p>
                            <h2 style="margin: 4px 0 0 0; font-size: 24px; color: ${isFree ? '#00a133' : '#ff6b6b'};">${priceDisplay}</h2>
                        </td>
                    </tr>
                </table>

                <!-- Event Details Grid (bg-tertiary) -->
                <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: #111827;">${eventTitle}</h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                        <tr>
                            <td valign="top" style="padding-bottom: 12px;" width="50%">
                                <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #6b7280;">Starts</p>
                                <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: bold; color: #111827;">${startDateFormatted}</p>
                            </td>
                            <td valign="top" style="padding-bottom: 12px;" width="50%">
                                <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #6b7280;">Ends</p>
                                <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: bold; color: #111827;">${endDateFormatted}</p>
                            </td>
                        </tr>
                        <tr>
                            <td valign="top">
                                <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #6b7280;">Admits</p>
                                <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: bold; color: #111827;">${quantity}</p>
                            </td>
                            <td valign="top">
                                <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #6b7280;">Format</p>
                                <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: bold; color: #111827;">${format === 'ONLINE' ? 'Online' : 'Venue'}</p>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- QR Code Section -->
                <div style="text-align: center; padding-top: 24px; border-top: 1px dashed #6b7280;">
                    <p style="margin: 0 0 16px 0; font-size: 12px; text-transform: uppercase; color: #4b5563; font-weight: bold; letter-spacing: 1px;">Scan at Entrance</p>
                    <img src="${qrImageUrl}" alt="Ticket QR Code" width="160" height="160" style="display: block; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; background-color: #ffffff;" />
                    <p style="margin: 16px 0 0 0; font-family: 'Intel One Mono', monospace; font-size: 16px; font-weight: bold; color: #111827;">${ticketNo}</p>
                </div>
            </div>
            
            <!-- Footer Strip -->
            <div style="background-color: #eeeeee; padding: 12px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 11px; color: #6b7280;">Event access subject to terms & conditions • ${new Date().getFullYear()}</p>
            </div>
        </div>
    `;
};
// services/notification-services/interfaces/INotificationService.ts
import { NotifyRequest } from "@/types/notification.types";





// This is the ONLY thing BookingService / EventManagementService / PayoutService
// need to depend on (DIP). They never touch channels, content, or the matrix directly.
export interface INotificationService {
    notify(request: NotifyRequest): Promise<void>;
    notifyMany(requests: NotifyRequest[]): Promise<void>;
}




// export interface INotificationService {
//     sendEventSuspendedToHost(hostRef: string, event: EventEntity, suspendReason: string): Promise<void>;
//     sendEventSuspendedToAttendees(eventId: string, suspendReason: string): Promise<void>;

//     sendBookingConfirmation(booking: BookingEntityPopulated): Promise<void>;
//     sendEventCancellation(event: EventEntity, refundAmount: number): Promise<void>;
//     // Add other specific domain methods here...
// }






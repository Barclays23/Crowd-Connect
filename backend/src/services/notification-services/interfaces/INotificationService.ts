// services/notification-services/interfaces/INotificationService.ts

import { EventEntity } from "@/entities/event.entity";

export interface INotificationService {
    sendEventSuspendedToHost(
        hostRef: string,
        event: EventEntity,
        suspendReason: string
    ): Promise<void>;

    sendEventSuspendedToAttendees(
        eventId: string,
        suspendReason: string
    ): Promise<void>;
}

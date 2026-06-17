// backend/src/services/queue-services/interfaces/IEventQueueService.ts



export interface IEventQueueService {
    scheduleEventCompletion(eventId: string, endDateTime: Date): Promise<void>;
    rescheduleEventCompletion(eventId: string, newEndDateTime: Date): Promise<void>;
    removeEventCompletionSchedule(eventId: string): Promise<void>;
}
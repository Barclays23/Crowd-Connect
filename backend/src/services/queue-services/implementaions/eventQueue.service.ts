// backend/src/services/queue-services/implementations/eventQueue.service.ts
import { Queue } from "bullmq";
import { IEventQueueService } from "../interfaces/IEventQueueService";
import { queueConnection } from "@/config/redis-queue.config";



export class EventQueueService implements IEventQueueService {
    private completionQueue: Queue;

    constructor() {
        // Initialize the BullMQ queue with the ioredis connection
        this.completionQueue = new Queue("event-completion-queue", { 
            // @ts-expect-error: BullMQ internal ioredis types conflict with project ioredis types
            connection: queueConnection
        });
    }



    async scheduleEventCompletion(eventId: string, endDateTime: Date): Promise<void> {
        const delayMs = endDateTime.getTime() - Date.now();
        const safeDelay = delayMs > 0 ? delayMs : 0;

        await this.completionQueue.add(
            "mark-event-completed",
            { eventId },
            {
                delay           : safeDelay,
                jobId           : `completion_event_${eventId}`, // Deterministic ID
                removeOnComplete: true,
                removeOnFail    : false
            }
        );

        console.log(`[Queue] Scheduled completion for event ${eventId} in ${safeDelay}ms`);
    }



    async rescheduleEventCompletion(eventId: string, newEndDateTime: Date): Promise<void> {
        const jobId = `completion_event_${eventId}`;
        const job = await this.completionQueue.getJob(jobId);

        const newDelayMs = newEndDateTime.getTime() - Date.now();
        const safeDelay = newDelayMs > 0 ? newDelayMs : 0;

        if (job) {
            await job.changeDelay(safeDelay);
            console.log(`[Queue] Rescheduled completion for event ${eventId}. New delay: ${safeDelay}ms`);

        } else {
            // Fallback if the job doesn't exist
            await this.scheduleEventCompletion(eventId, newEndDateTime);
        }
    }



    async removeEventCompletionSchedule(eventId: string): Promise<void> {
        const jobId = `completion_event_${eventId}`;
        const job = await this.completionQueue.getJob(jobId);

        if (job) {
            await job.remove();
            console.log(`[Queue] Removed completion schedule for event ${eventId}`);
        }
    }


}
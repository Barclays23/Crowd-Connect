// backend/src/workers/eventCompletion.worker.ts

import { Worker, Job } from "bullmq";
import { queueConnection } from "@/config/redis-queue.config";
import Event from "@/models/implementations/event.model";
import { EVENT_STATUS } from "@/types/event.types";




export const startEventWorker = () => {
    const worker = new Worker(
        "event-completion-queue",
        async (job: Job) => {
            const { eventId } = job.data;
            console.log(`[Worker] Processing completion for event: ${eventId}`);

            try {
                // Find the event. Only proceed if it is currently PUBLISHED.
                const event = await Event.findOne({
                    _id         : eventId,
                    eventStatus : EVENT_STATUS.PUBLISHED
                });

                if (!event) {
                    console.log(`[Worker] Event ${eventId} not found or not PUBLISHED. Skipping.`);
                    return;
                }

                // Safety check: verify time has actually passed
                if (event.endDateTime <= new Date()) {
                    event.eventStatus = EVENT_STATUS.COMPLETED;
                    await event.save();
                    
                    console.log(`[Worker] Successfully marked event ${eventId} as COMPLETED.`);
                    
                    // Note: In Phase 4, you can trigger post-event notifications from here.
                } else {
                    console.warn(`[Worker] Job fired early for event ${eventId}. Skipping.`);
                }

            } catch (error) {
                console.error(`[Worker] Failed to complete event ${eventId}:`, error);
                throw error; 
            }
        },
        { 
            // @ts-expect-error: BullMQ internal ioredis types conflict with project ioredis types
            connection: queueConnection 
        }
    );

    worker.on("completed", (job) => {
        console.log(`[Worker] Job ${job.id} completed successfully`);
    });

    worker.on("failed", (job, err) => {
        console.error(`[Worker] Job ${job?.id} failed: ${err.message}`);
    });

    console.log("✅ Event Completion Worker started");
};
// backend/src/config/redis-queue.config.ts

import IORedis from "ioredis";  // Import ioredis here specifically for BullMQ (not for cache services)
import 'dotenv/config';



const redisUrl: string = process.env.REDIS_URL as string;



if (!redisUrl){
    throw new Error('REDIS_URL is required for the queue connection');
}


// Create a dedicated IORedis instance for BullMQ
export const queueConnection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null, // Required by BullMQ
    // tls: {
    //     rejectUnauthorized: false // Bypasses strict certificate checks (standard for Redis cloud free/dev tiers)
    // }
});

queueConnection.on("error", (err: Error) => {
    console.error("❌ Queue Redis Connection Error:", err);
});

queueConnection.on("connect", () => {
    console.log("✅ Queue Redis connection established for BullMQ");
});
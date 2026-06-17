// backend/src/config/redis-cache.config.ts

import { createClient } from 'redis';
import 'dotenv/config';


// rename to CACHE_DATA_TTL_SECONDS, CACHE_TOKEN_PREFIX and move to constants file
const REDIS_DATA_TTL_SECONDS: number    = 30 * 60; // TTL expiry: 30 minutes in seconds
const REDIS_TOKEN_PREFIX: string        = 'auth-token:';

const redisUrl = process.env.REDIS_URL as string;

if (!redisUrl) {
    throw new Error('REDIS_URL is required in environment variables');
}


const redisClient = createClient({ 
    url: redisUrl,
    // socket: {
    //     tls: true,
    //     rejectUnauthorized: false // Matches the ioredis setup
    // }
});





redisClient.on("error", (err) => {
    console.error("❌ Redis Client Error:", err);
});

redisClient.on("connect", () => {
    console.log("✅ Successfully connected to Redis");
});


async function connectRedis() {
    try {
        if (!redisClient.isOpen) await redisClient.connect();
        console.log("🟢 Redis connection established");
        
    } catch (error) {
        console.error("❌ Failed to connect to Redis:", error);
        // In production you might choose to exit process or retry depending on use case
        // process.exit(1);
    }
}


async function disconnectRedis() {
  try {
    if (redisClient.isOpen) await redisClient.quit();
  } catch (err) {
    console.error('Error during Redis shutdown', err);
  }
}



export { 
    redisClient, 
    connectRedis, 
    disconnectRedis, 
    REDIS_DATA_TTL_SECONDS, 
    REDIS_TOKEN_PREFIX 
};

// run as administrator command prompt to flush dns
// ipconfig /flushdns
import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL as string;

const REDIS_DATA_TTL_SECONDS: number = 30 * 60; // 30 minutes in seconds

const redisClient = createClient({ url: redisUrl });
if (!redisUrl) throw new Error('REDIS_URL is required');



// const client = createClient({
//     username: 'default',
//     password: '*******',
//     socket: {
//         host: 'redis-11592.crce206.ap-south-1-1.ec2.cloud.redislabs.com',
//         port: 11592
//     }
// });


// const redisClient = createClient({
//   url: redisUrl,
//   socket: {
//     // reconnectStrategy receives a retry count and returns ms to wait, or false to stop
//     reconnectStrategy: (retries) => Math.min(retries * 100, 2000),
//     // optional connect timeout in ms:
//     connectTimeout: 10_000,
//     // keepAlive true helps long-lived connections:
//     keepAlive: 60_000,
//     // If you need to customize TLS certificate validation (not recommended for prod),
//     // you can pass tls options here (node's tls.connect options).
//     // tls: { rejectUnauthorized: true }
//   },
//   // Optional: commandTimeout, legacyMode, etc.
// });



redisClient.on("error", (err) => {
    console.error("❌ Redis Client Error:", err);
});

redisClient.on("connect", () => {
    console.log("✅ Successfully connected to Redis");
});


async function connectRedis() {
    try {
        if (!redisClient.isOpen) await redisClient.connect();
        console.log("🔌 Redis connection established");
        
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



export { redisClient, connectRedis, disconnectRedis, REDIS_DATA_TTL_SECONDS };

// run as administrator command prompt to flush dns
// ipconfig /flushdns
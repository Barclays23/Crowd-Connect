import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import app from '@/app';
import { connectDB } from '@/config/db.config';
import { connectRedis } from '@/config/redis-cache.config';
import { startEventWorker } from '@/workers/eventCompletion.worker';
import { socketService } from '@/services/notification-services/implementations/NotificationServiceFactory';





const PORT = process.env.PORT;


const startServer = async () => {    
    await connectDB();
    await connectRedis();
    startEventWorker();

    const server = http.createServer(app);
    socketService.initialize(server);

    server.listen(PORT, () => {
        console.log(`🖥️  Server running on http://localhost:${PORT}`);
    });
};


startServer();
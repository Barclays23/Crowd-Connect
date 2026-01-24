import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import { connectDB } from './config/db.config.js';
import { connectRedis } from './config/redis.config.js';



const PORT = process.env.PORT;


const startServer = async () => {    
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};


startServer();
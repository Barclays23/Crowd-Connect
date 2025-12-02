import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import { connectDB } from './config/db.config';
import { connectRedis } from './config/redis.config';



const PORT = process.env.PORT;


const startServer = async () => {    
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};


startServer();
import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

export const connectDB = async () => {
    if (!MONGO_URI) throw new Error('MONGO_URI not set in env');
    
    try {
        await mongoose.connect(MONGO_URI);
        console.log(`MongoDB connected to ${MONGO_URI}`);
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};
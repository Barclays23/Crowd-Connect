import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// import helmet from 'helmet';
// import morgan from 'morgan';

import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middlewares/error.middleware';


const app = express();


// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(helmet());
// app.use(morgan('dev'));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);


// Error handler
app.use(errorHandler);


export default app;
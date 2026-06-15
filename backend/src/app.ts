import express from 'express';
// import webhookRoutes from './routes/webhook.routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// import helmet from 'helmet';


import { errorHandler } from '@/middlewares/error.middleware';

import authRoutes from '@/routes/auth.routes';
import adminRoutes from '@/routes/admin.routes';
import userRouter from '@/routes/user.routes';
import hostRouter from '@/routes/host.routes';
import eventRouter from '@/routes/event.routes';
import bookingRouter from '@/routes/booking.routes';
import walletRouter from '@/routes/wallet.routes';
import settingsRouter from '@/routes/settings.routes';


import morganMiddleware from '@/config/morgan.config';
import webhookRouter from '@/routes/webhook.routes';
import checkinRouter from '@/routes/checkin.routes';
import payoutRouter from '@/routes/payout.routes';
import { configurePassport } from '@/config/passport.config';
import passport from 'passport';


const app = express();


// Middlewares
// app.use(cors({ origin: true, credentials: true }));
const rawFrontendUrls = process.env.FRONTEND_URL || "";
const allowedOrigins = rawFrontendUrls
  .split(',')
  .map(url => url.trim())
  .filter(url => url.length > 0);

allowedOrigins.push("http://localhost:5173");

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRouter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morganMiddleware);
// app.use(helmet());
// app.use(morgan('dev'));


// Initialize Passport
configurePassport();
app.use(passport.initialize());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRouter);
app.use('/api/host', hostRouter);
app.use('/api/event', eventRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/event/:eventId/checkin', checkinRouter);
app.use('/api/payout', payoutRouter);


app.use(errorHandler);


export default app;
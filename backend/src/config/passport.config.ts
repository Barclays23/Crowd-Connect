// backend/src/config/passport.config.ts
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { AuthSessionService } from '@/services/auth-services/implementations/authSession.service';
import { UserRepository } from '@/repositories/implementations/user.repository';
import { RedisCacheService } from '@/services/cache-services/implementations/redisCache.service';
import { AuthResult } from '@/types/auth.types';
import { AUTH_ROUTES } from '@/constants/routes.constants';


// Initialize dependencies for the strategy
const userRepository    = new UserRepository();
const cacheService      = new RedisCacheService();
const sessionService    = new AuthSessionService(userRepository, cacheService);


export const configurePassport = () => {
    // const backendBaseUrl    = process.env.BACKEND_URL;
    // const authPath          = '/api/auth';
    // const callBackRoute     = AUTH_ROUTES.GOOGLE_CALLBACK;
    // const callbackURL       = `${backendBaseUrl}${authPath}${callBackRoute}`

    const callbackURL = process.env.GOOGLE_AUTH_CALLBACK_URL as string;
    
    // console.log('callbackURL :', callbackURL)
    
    passport.use(new GoogleStrategy({
        clientID    : process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL : callbackURL
    },

    async (accessToken: string, refreshToken: string, googleProfile: Profile, done: any) => {
        try {
            const authResult: AuthResult = await sessionService.handleGoogleAuth(googleProfile);
            return done(null, authResult);

        } catch (error) {
            return done(error, false);
        }
    }));
};
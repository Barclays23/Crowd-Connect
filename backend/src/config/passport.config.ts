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
    // const frontendBaseUrl   = process.env.FRONTEND_URL;
    const backendBaseUrl    = process.env.BACKEND_URL || 'http://localhost:5000';
    const authPath          = '/api/auth';
    const callBackRoute     = AUTH_ROUTES.GOOGLE_CALLBACK;

    const callbackURL       = `${backendBaseUrl}${authPath}${callBackRoute}`

    console.log('configurePassport callbackURL :', 
        '\n backendBaseUrl  :', backendBaseUrl,
        '\n authPath        :', authPath,
        '\n callBackRoute   :', callBackRoute,
    )
    
    passport.use(new GoogleStrategy({
        clientID    : process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL : callbackURL
    },

    async (accessToken: string, refreshToken: string, googleProfile: Profile, done: any) => {
        try {
            const authResult: AuthResult = await sessionService.handleGoogleAuth(googleProfile);
            console.log('configurePassport authResult :', authResult);

            return done(null, authResult);

        } catch (error) {
            return done(error, false);
        }
    }));
};
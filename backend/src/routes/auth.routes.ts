// backend/src/routes/auth.routes.ts
import { Router } from 'express';
import { validateRequest } from '@/middlewares/validate.middleware';
import { authenticate } from '@/middlewares/auth.middleware';

import { 
    ForgotPasswordSchema, 
    LoginSchema, 
    RegisterSchema, 
    ResetLinkSchema, 
    ResetPasswordSchema 
} from '@/schemas/auth.schema';
import { OtpSchema } from '@/schemas/otp.schema';


import { AUTH_ROUTES } from '@/constants/routes.constants';
import passport from 'passport';
import { AuthProvider } from '@/types/user.types';
import { authController } from '@/container/dependencies';






const authRouter = Router();



authRouter.post(AUTH_ROUTES.LOGIN, validateRequest({body: LoginSchema}), authController.signIn.bind(authController));
authRouter.post(AUTH_ROUTES.REGISTER, validateRequest({body: RegisterSchema}), authController.signUp.bind(authController));

// initiate Google Auth
authRouter.get(
    AUTH_ROUTES.GOOGLE_LOGIN,
    passport.authenticate(AuthProvider.GOOGLE, { scope: ['profile', 'email'] })
);

// callback route that Google hits
authRouter.get(
    AUTH_ROUTES.GOOGLE_CALLBACK,
    passport.authenticate(AuthProvider.GOOGLE, { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }),
    authController.googleAuthCallback.bind(authController)
);

authRouter.post(AUTH_ROUTES.FORGOT_PASSWORD, validateRequest({body: ForgotPasswordSchema}), authController.requestPasswordReset.bind(authController));
authRouter.get(AUTH_ROUTES.RESET_PASSWORD_VALIDATE, validateRequest({params: ResetLinkSchema}), authController.validateResetLink.bind(authController));
authRouter.post(AUTH_ROUTES.RESET_PASSWORD, validateRequest({body: ResetPasswordSchema}), authController.resetPassword.bind(authController));

authRouter.post(AUTH_ROUTES.VERIFY_ACCOUNT, validateRequest({body: OtpSchema}), authController.verifyAccount.bind(authController));
authRouter.post(AUTH_ROUTES.AUTHENTICATE_EMAIL, authenticate, authController.requestAuthenticateEmail.bind(authController));
authRouter.post(AUTH_ROUTES.VERIFY_EMAIL, authenticate, validateRequest({body: OtpSchema}), authController.updateVerifiedEmail.bind(authController));
authRouter.post(AUTH_ROUTES.RESEND_OTP, authController.resendOtp.bind(authController));

authRouter.post(AUTH_ROUTES.REFRESH_TOKEN, authController.refreshAccessToken.bind(authController));

authRouter.post(AUTH_ROUTES.LOGOUT, authController.logout.bind(authController));
authRouter.get(AUTH_ROUTES.ME, authenticate, authController.getAuthUser.bind(authController));





export default authRouter;
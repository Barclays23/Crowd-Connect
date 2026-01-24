// backend/src/routes/auth.routes.ts
import { Router } from 'express';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';

import { 
    ForgotPasswordSchema, 
    LoginSchema, 
    RegisterSchema, 
    ResetLinkSchema, 
    ResetPasswordSchema 
} from '../schemas/auth.schema.js';
import { OtpSchema } from '../schemas/otp.schema.js';

import { UserRepository } from '../repositories/implementations/user.repository.js';

import { AuthRegistrationService } from '../services/auth-services/auth-implementations/authRegistration.service.js';
import { AuthSessionService } from '../services/auth-services/auth-implementations/authSession.service.js';
import { AuthRecoveryService } from '../services/auth-services/auth-implementations/authRecovery.service.js';

import { AuthController } from '../controllers/implementations/auth.controller.js';

import { AUTH_ROUTES } from '../constants/routes.constants.js';




// REPOS
const userRepository = new UserRepository()


// SERVICES
const registrationService = new AuthRegistrationService(userRepository);
const sessionService = new AuthSessionService(userRepository);
const recoveryService = new AuthRecoveryService(userRepository);


// CONTROLLER
const authController = new AuthController(
    registrationService, 
    sessionService, 
    recoveryService
);


const authRouter = Router();


authRouter.post(AUTH_ROUTES.LOGIN, validateRequest({body: LoginSchema}), authController.signIn.bind(authController));
authRouter.post(AUTH_ROUTES.REGISTER, validateRequest({body: RegisterSchema}), authController.signUp.bind(authController));

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
// authRouter.post('/edit-profile', authController.editProfile.bind(authController));




export default authRouter;
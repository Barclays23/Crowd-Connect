// backend/src/routes/auth.routes.ts
import { Router, Request, Response } from 'express';
import { validateRequest } from '../middlewares/validate.middleware';
// import { RegisterSchema } from '@shared/schemas/authSchema';
import { LoginSchema, RegisterSchema } from '../../../shared/schemas/auth.schema';
import { OtpSchema } from '../../../shared/schemas/otp.schema';
import { UserRepository } from '../repositories/implementations/user.repository';
import { AuthServices } from '../services/implementations/auth.services';
import { AuthController } from '../controllers/implementations/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';




const authRouter = Router();

const userRepository = new UserRepository()
const authServices = new AuthServices(userRepository)
const authController = new AuthController(authServices)



authRouter.post('/login', validateRequest({body: LoginSchema}), authController.signIn.bind(authController));
authRouter.post('/register', validateRequest({body: RegisterSchema}), authController.signUp.bind(authController));
authRouter.post('/verify-otp', validateRequest({body: OtpSchema}), authController.verifyOtp.bind(authController));
authRouter.post('/resend-otp', authController.resendOtp.bind(authController));
authRouter.post('/refresh-token', authController.refreshAccessToken.bind(authController));
authRouter.post('/logout', authController.logout.bind(authController));
authRouter.get('/me', authenticate, authController.getAuthUser.bind(authController));
// authRouter.post('/edit-profile', authController.editProfile.bind(authController));




export default authRouter;
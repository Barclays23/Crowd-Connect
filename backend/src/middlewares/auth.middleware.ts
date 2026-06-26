// backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/jwt.utils';
import { createHttpError } from '@/utils/httpError.utils';
import { HTTP_STATUS } from '@/constants/http-status.constants';
import { UserRepository } from '@/repositories/implementations/user.repository';
import { USER_STATUS, UserRole, UserStatus } from '@/constants/user-system.constants';
import { AUTH_MESSAGES, USER_MESSAGES } from '@/constants/messages.constants';




// Extend Express Request interface to include userId
declare global {
   namespace Express {
      interface Request {
         user?: {
            userId   : string;
            email    : string;
            role     : UserRole;
            status   : UserStatus;
         };
      }
   }
}



interface AuthenticatedRequest extends Request {}




export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
   const authHeader = req.headers.authorization;

   if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createHttpError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.TOKEN_MISSING);
   }

   const token = authHeader.split(" ")[1];
   let decoded;

   try {
      decoded = verifyAccessToken(token);
   } catch (err) {
      console.log('Token verification failed:', err);
      throw createHttpError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.TOKEN_INVALID_OR_EXPIRED);
   }

   if (!decoded?.userId) {
      throw createHttpError(HTTP_STATUS.UNAUTHORIZED, "Invalid token payload");
   }

   const userRepo = new UserRepository();  // can directly use UserRepository here ??
   const user = await userRepo.getUserById(decoded.userId);

   if (!user) {
      throw createHttpError(HTTP_STATUS.UNAUTHORIZED, USER_MESSAGES.USER_ACCOUNT_NOT_EXIST);
   }

   if (user.status === USER_STATUS.BLOCKED) {
      throw createHttpError(
         HTTP_STATUS.FORBIDDEN,
         USER_MESSAGES.USER_ACCOUNT_BLOCKED,
         "USER_ACCOUNT_BLOCKED"  // for axios intercepter
      );
   }

   req.user = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      status: user.status
   };

   next();
};





export const authorize = (...allowedRoles: Array<UserRole>) => {
   return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const user = req.user;

      if (!user?.role) {
         throw createHttpError(HTTP_STATUS.UNAUTHORIZED, "Authentication required");
      }

      if (!allowedRoles.includes(user.role)) {
         throw createHttpError(HTTP_STATUS.FORBIDDEN, "You don’t have permission to access this feature");
      }

      next();
   };
};

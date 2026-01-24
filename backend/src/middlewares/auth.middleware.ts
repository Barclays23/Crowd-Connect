// backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils.js';
import { createHttpError } from '../utils/httpError.utils.js';
import { HttpStatus } from '../constants/statusCodes.constants.js';
import { HttpResponse } from '../constants/responseMessages.constants.js';
import { UserRepository } from '../repositories/implementations/user.repository.js';
import { UserRole, UserStatus } from '../constants/roles-and-statuses.js';




// Extend Express Request interface to include userId
declare global {
   namespace Express {
      interface Request {
         user: {
            userId: string;
            email: string;
            role: UserRole;
            status: UserStatus;
         };
      }
   }
}



interface AuthenticatedRequest extends Request {}




export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
   const authHeader = req.headers.authorization;

   if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.TOKEN_MISSING);
   }

   const token = authHeader.split(" ")[1];
   let decoded;

   try {
      decoded = verifyAccessToken(token);
   } catch (err) {
      console.log('Token verification failed:', err);
      throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.TOKEN_INVALID_OR_EXPIRED);
   }

   if (!decoded?.userId) {
      throw createHttpError(HttpStatus.UNAUTHORIZED, "Invalid token payload");
   }

   const userRepo = new UserRepository();  // can directly use UserRepository here ??
   const user = await userRepo.getUserById(decoded.userId);

   if (!user) {
      throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.USER_ACCOUNT_NOT_EXIST);
   }

   if (user.status === UserStatus.BLOCKED) {
      throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.USER_ACCOUNT_BLOCKED);
   }

   req.user = {
      userId: user.id,
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
         throw createHttpError(HttpStatus.UNAUTHORIZED, "Authentication required");
      }

      if (!allowedRoles.includes(user.role)) {
         throw createHttpError(HttpStatus.FORBIDDEN, "You don’t have permission to access this feature");
      }

      next();
   };
};
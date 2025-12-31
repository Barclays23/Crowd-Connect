// backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import { createHttpError } from '../utils/httpError.utils';
import { HttpStatus } from '../constants/statusCodes';
import { HttpResponse } from '../constants/responseMessages';
import { UserRepository } from '../repositories/implementations/user.repository';




// Extend Express Request interface to include userId
declare global {
   namespace Express {
      interface Request {
         userId?: string;
         user?: any; // Optionally, for role-based middleware
      }
   }
}



interface AuthenticatedRequest extends Request {
   user?: {
      userId: string;
      email: string;
      role: 'user' | 'host' | 'admin';
      status: string; // or UserStatus enum
   };
}




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

   if (user.status === 'blocked') {
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





export const authorize = (...allowedRoles: Array<'user' | 'host' | 'admin'>) => {
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
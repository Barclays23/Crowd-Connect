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
      status: string; // or your UserStatus enum
   };
}

// import { getUserById } from '../services/implementations/auth.services';





// 1. Main middleware — attach to protected routes
// export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
//    const authHeader = req.headers.authorization;

//    // Check Authorization header first (Bearer token)
//    if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.TOKEN_MISSING)
//    }

//    const token = authHeader.split(" ")[1];

//    try {
//       // Verify access token
//       const decoded = verifyAccessToken(token);
      
//       if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
//          console.log('Invalid or expired token payload in auth.middleware.protect');
//          // what does this error mean?
//          throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.TOKEN_INVALID_OR_EXPIRED);
//       }

//       // Fetch user from DB to ensure they still exist and are active
//       const userRepo = new UserRepository();
//       const user: UserEntity | null = await userRepo.findUserById(decoded.userId);

//       if (!user) {
//          return res
//          .status(HttpStatus.UNAUTHORIZED)
//          .json({ success: false, message: HttpResponse.USER_ACCOUNT_NOT_EXIST });
//       }


//       if (user.status === 'blocked') {
//          return res
//          .status(HttpStatus.FORBIDDEN)
//          .json({ success: false, message: HttpResponse.USER_ACCOUNT_BLOCKED });
//       }

//       req.user = {
//         userId: user.id,
//         email: user.email,
//         role: user.role,
//         status: user.status
//         // add more fields if needed
//       };

//       // req.userId = decoded.userId;

//       console.log('authenticate middleware passed');
//       next();

//    } catch (error) {
//       // Access token expired or invalid
//       console.log('❌ Error in auth.middleware.authenticate:', error);

//       // sending the 401 error to axios interceptor when access token expired or invalid (response.data.message)
//       res.status(401).json({ message: 'Not authorized, access token is expired or failed.' });

//       // throw error to handling middleware.
//       throw new Error('Not authorized, token failed');
//    }
   
// };


// auth.middleware.ts

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

   const userRepo = new UserRepository();
   const user = await userRepo.findUserById(decoded.userId);

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





// export const authorize = (...allowedRoles: Array<'user' | 'host' | 'admin'>) => {
//    return (req: Request, res: Response, next: NextFunction) => {
//       //  if (!req.user) {
//       //    return res
//       //      .status(HttpStatus.UNAUTHORIZED)
//       //      .json({ success: false, message: 'Authentication required' });
//       //  }
      
//       const userRole = req.user?.role;
//       console.log('User role in authorize middleware:', userRole);

//       if (!allowedRoles.includes(userRole)) {
//          return res
//          .status(HttpStatus.FORBIDDEN)
//          .json({ success: false, message: 'Forbidden: Insufficient permissions' });

//          // .status(HttpStatus.FORBIDDEN)
//          // throw new Error('Forbidden: Insufficient permissions');
//       }

//       next();
//    };
// };




export const authorize = (...allowedRoles: Array<'user' | 'host' | 'admin'>) => {
   return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const user = req.user;

      if (!user?.role) {
         throw createHttpError(HttpStatus.UNAUTHORIZED, "Authentication required");
      }

      if (!allowedRoles.includes(user.role)) {
         throw createHttpError(HttpStatus.FORBIDDEN, "Forbidden: Insufficient permissions");
      }

      next();
   };
};
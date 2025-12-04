// backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import { createHttpError } from '../utils/httpError.utils';
import { HttpStatus } from '../constants/statusCodes';
import { HttpResponse } from '../constants/responseMessages';



// Extend Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any; // Optionally, for role-based middleware
    }
  }
}

// import { getUserById } from '../services/implementations/auth.services';





// 1. Main middleware — attach to protected routes
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
   const authHeader = req.headers.authorization;

   // Check Authorization header first (Bearer token)
   if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.TOKEN_MISSING)
   }

   const token = authHeader.split(" ")[1];

   try {
      // Verify access token
      const decoded = verifyAccessToken(token);

      // Fetch user from DB (optional, but recommended)
      // const user = await getUserById(decoded.userId);
      
      if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
         console.log('Invalid or expired token payload in auth.middleware.protect');
         // what does this error mean?
         throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.TOKEN_INVALID_OR_EXPIRED);
      }

      // req.user = {
      //   userId: user.id,
      //   email: user.email,
      //   role: user.role,
      //   // add more fields if needed
      // };

      req.userId = decoded.userId;

      console.log('authenticate middleware passed');
      next();

   } catch (error) {
      // Access token expired or invalid
      console.log('❌ Error in auth.middleware.authenticate:', error);

      // sending the 401 error to axios interceptor when access token expired or invalid (response.data.message)
      res.status(401).json({ message: 'Not authorized, access token is expired or failed.' });

      // throw error to handling middleware.
      throw new Error('Not authorized, token failed');
   }
   
};





// 2. Optional: Role-based middleware (admin only, etc.)
export const authorize =
   (...roles: string[]) =>
   (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !roles.includes(req.user.role)) {
         res.status(403);
         throw new Error('Forbidden: Insufficient permissions');
      }
      next();
};
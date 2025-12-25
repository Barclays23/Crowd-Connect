// backend/src/middlewares/error.middleware.ts

import { Request, Response, NextFunction } from 'express';


// export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
//     console.warn('errorHandler middleware error--------------------------:', err);
//     const status = err.statusCode || 500;
//     res.status(status).json({ message: err?.message || 'Internal server error' });
// };





export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
   console.error('Error handler caught:', err);

   // Very important safety
   if (res.headersSent) {
      console.warn('Response already sent — cannot send error. Original error:', err);
      return next(err); // just in case some other strange middleware
   }

   const status = err.statusCode || err.status || 500;
   const message = err.message || 'Internal server error';

   res.status(status).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
   });
};
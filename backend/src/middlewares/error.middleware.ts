// backend/src/middlewares/error.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { HttpError } from '@/utils/httpError.utils';
import winstonLogger from '@/config/logger';


function hasErrorCode(err: unknown): err is { code: number } {
   return (
      typeof err === 'object' && 
      err !== null && 
      'code' in err && 
      typeof (err as { code: unknown }).code === 'number'
   );
}



const isDatabaseError = (err: unknown): boolean => {
   if (!err || typeof err !== 'object' || err === null) return false;

   if (err instanceof Error) {
      const dbErrorIndicators = ['Mongo', 'mongoose', 'CastError', 'ValidationError'];

      if (dbErrorIndicators.some(keyword => err.name.includes(keyword))) {
         return true;
      }
   }


   if (hasErrorCode(err)) {
      return true;
   }

   return false;

};




export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
   // console.error('❌❌❌ errorHandler error --------------------------:', err);

   winstonLogger.error('❌❌❌ Unhandled Exception Caught in Error Middleware ❌❌:', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      path: req.originalUrl, //  Log WHICH route failed!
      method: req.method,    //  Log IF it was GET, POST, etc.
   });

   // Very important safety
   if (res.headersSent) {
      // Narrowing here so we can safely log the message
      const msg = err instanceof Error ? err.message : 'Unknown Error';
      // console.warn('Response already sent — cannot send error. Original error:', msg);
      winstonLogger.warn('Response already sent — cannot send error. Original error:', { originalError: msg });
      return next(err);  // just in case some other strange middleware
   }

   let status = 500; 
   let message = 'Something went wrong. Please try again later.';
   let code: string | undefined;


   // NARROWING: 
   // Check if the error is an instance of custom HttpError
   if (err instanceof HttpError) {
      status = err.statusCode;
      message = err.message;
      code = err.code;

   // database-related errors (present or future)
   } else if (isDatabaseError(err)) {
      message = 'We’re having trouble processing your request right now. Please try again later.';

   // Handle all other JavaScript errors (like SyntaxError or ReferenceError)
   } else if (err instanceof Error) {
      // message = process.env.NODE_ENV != 'development'
      message = process.env.NODE_ENV === 'development'
         ? err.message
         : 'Internal Server Error';
   }

   // console.log('🔥 Final errorHandler error message to send frontend: ', message);
   winstonLogger.debug('🔥 Final error message sent to frontend', { message, status });

   res.status(status).json({
      success: false,
      message,
      code,
      ...(process.env.NODE_ENV === 'development' && err instanceof Error && { stack: err.stack }),
   });
};
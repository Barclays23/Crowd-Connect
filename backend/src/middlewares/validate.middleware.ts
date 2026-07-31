import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { HTTP_STATUS } from '@/constants/http-status.constants';
import { formatZodErrorMessages } from '@/utils/formatZodErrors';
import { AUTH_MESSAGES } from '@/constants/messages.constants';



export interface ValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}


export const validateRequest = (schemas: ValidationSchemas) => (req: Request, res: Response, next: NextFunction) => {
   try {
      // 1. Validate req.body
      if (schemas.body) {
         req.body = schemas.body.parse(req.body);
      }

      // 2. Validate req.query
      if (schemas.query) {
         // req.query = schemas.query.parse(req.query) as ParsedQs;
         const parsedQuery = schemas.query.parse(req.query);
         
         // Express defines req.query as a getter. We must redefine the property descriptor.
         Object.defineProperty(req, 'query', {
            value: parsedQuery,
            writable: true,
            configurable: true,
            enumerable: true
         });
      }

      // 3. Validate req.params
      if (schemas.params) {
         // req.params = schemas.params.parse(req.params) as ParamsDictionary;
         
         const parsedParams = schemas.params.parse(req.params);
         
         // Applying the same robust approach to params
         Object.defineProperty(req, 'params', {
            value: parsedParams,
            writable: true,
            configurable: true,
            enumerable: true
         });
      }

      // If all checks pass, proceed to the next middleware or controller
      next();

   } catch (error) {
      if (error instanceof ZodError) {
         console.log('Zod Validation Error.issues:', error.issues);
         
         // Zod validation failed
         res.status(HTTP_STATUS.BAD_REQUEST).json({
            error: AUTH_MESSAGES.INVALID_CREDENTIALS,
            // message: "Validation Failed", // Or a dedicated VALIDATION_ERROR constant
            details: formatZodErrorMessages(error.issues),
         });

         return;
      }
      
      // Handle other potential errors (though unlikely here)
      next(error);
   }
};



export const validateBody = (schema: ZodType) => validateRequest({ body: schema });

export const validateParams = (schema: ZodType) => validateRequest({ params: schema });

export const validateQuery = (schema: ZodType) => validateRequest({ query: schema });
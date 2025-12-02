import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodType, ZodError } from 'zod';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { HttpStatus } from '../constants/statusCodes';
import { HttpResponse } from '../constants/responseMessages';
import { formatZodErrorMessages } from '../utils/formatZodErrors';


export interface ValidationSchemas {
    body?: ZodType; // Replaced ZodSchema with ZodType
    query?: ZodType; // Replaced ZodSchema with ZodType
    params?: ZodType; // Replaced ZodSchema with ZodType
}


export const validateRequest = (schemas: ValidationSchemas) => // validateRequest or validateForm
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Validate req.body
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      // 2. Validate req.query
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as ParsedQs;
      }

      // 3. Validate req.params
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as ParamsDictionary;
      }

      // If all checks pass, proceed to the next middleware or controller
      next();

    } catch (error) {
        if (error instanceof ZodError) {
            console.log('Zod Validation Error:', error.issues);
            
            // Zod validation failed
            res.status(HttpStatus.BAD_REQUEST).json({
                error: HttpResponse.INVALID_CREDENTIALS,
                details: formatZodErrorMessages(error.issues),
            });
        }
      
      // Handle other potential errors (though unlikely here)
      // next(error); 
    }
};



export const validateBody = (schema: ZodType) => 
  validateRequest({ body: schema });

export const validateParams = (schema: ZodType) => 
  validateRequest({ params: schema });

export const validateQuery = (schema: ZodType) => 
  validateRequest({ query: schema });
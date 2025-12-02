// backend/src/middlewares/error.middleware.ts

import { Request, Response, NextFunction } from 'express';


export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.warn('errorHandler middleware error--------------------------:', err);
    const status = err.statusCode || 500;
    res.status(status).json({ message: err?.message || 'Internal server error' });
};
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './errorHandler';

export const validate = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Pass it to the global error handler
                error.name = 'ZodError';
                next(error);
            } else {
                next(new AppError('Internal validation error', 500));
            }
        }
    };
};

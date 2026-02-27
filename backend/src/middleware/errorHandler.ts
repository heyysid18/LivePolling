import { Request, Response, NextFunction } from 'express';

// Custom error class to easily throw known HTTP errors
export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Log the error in development or if it's not operational
    if (process.env.NODE_ENV !== 'production' || !err.isOperational) {
        console.error('ERROR 💥:', err);
    }

    // Handle specific mongoose errors gracefully
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map((val: any) => val.message).join(', ');
    } else if (err.code === 11000) {
        statusCode = 400;
        message = 'Duplicate field value entered';
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Special case for Zod Errors from validation middleware
    if (err.name === 'ZodError') {
        statusCode = 400;
        message = err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
    }

    res.status(statusCode).json({
        status: 'error',
        message
    });
};

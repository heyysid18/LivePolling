"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
// Custom error class to easily throw known HTTP errors
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    // Log the error in development or if it's not operational
    if (process.env.NODE_ENV !== 'production' || !err.isOperational) {
        console.error('ERROR 💥:', err);
    }
    // Handle specific mongoose errors gracefully
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map((val) => val.message).join(', ');
    }
    else if (err.code === 11000) {
        statusCode = 400;
        message = 'Duplicate field value entered';
    }
    else if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }
    // Special case for Zod Errors from validation middleware
    if (err.name === 'ZodError') {
        statusCode = 400;
        message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    }
    res.status(statusCode).json({
        status: 'error',
        message
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map
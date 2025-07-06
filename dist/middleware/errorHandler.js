"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const errors_1 = require("@/utils/errors");
const response_1 = require("@/utils/response");
const logger_1 = require("@/utils/logger");
const errorHandler = (error, req, res, next) => {
    logger_1.logger.error('Error occurred:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    if (error instanceof errors_1.AppError) {
        response_1.ResponseHandler.error(res, error.message, error.statusCode);
        return;
    }
    if (error.name === 'ValidationError') {
        const message = Object.values(error.errors)
            .map((err) => err.message)
            .join(', ');
        response_1.ResponseHandler.badRequest(res, 'Validation failed', message);
        return;
    }
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        const message = `${field} already exists`;
        response_1.ResponseHandler.conflict(res, message);
        return;
    }
    if (error.name === 'CastError') {
        response_1.ResponseHandler.badRequest(res, 'Invalid ID format');
        return;
    }
    if (error.name === 'JsonWebTokenError') {
        response_1.ResponseHandler.unauthorized(res, 'Invalid token');
        return;
    }
    if (error.name === 'TokenExpiredError') {
        response_1.ResponseHandler.unauthorized(res, 'Token expired');
        return;
    }
    if (error.name === 'MulterError') {
        if (error.code === 'LIMIT_FILE_SIZE') {
            response_1.ResponseHandler.badRequest(res, 'File too large');
            return;
        }
        response_1.ResponseHandler.badRequest(res, 'File upload error');
        return;
    }
    response_1.ResponseHandler.internalError(res, 'Something went wrong');
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    response_1.ResponseHandler.notFound(res, `Route ${req.originalUrl} not found`);
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map
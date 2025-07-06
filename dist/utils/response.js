"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseHandler = void 0;
class ResponseHandler {
    static success(res, data, message = 'Success', statusCode = 200) {
        const response = {
            success: true,
            message,
            data,
        };
        return res.status(statusCode).json(response);
    }
    static error(res, message = 'Internal Server Error', statusCode = 500, error) {
        const response = {
            success: false,
            message,
            error,
        };
        return res.status(statusCode).json(response);
    }
    static paginated(res, data, pagination, message = 'Success', statusCode = 200) {
        const response = {
            success: true,
            message,
            data,
            pagination,
        };
        return res.status(statusCode).json(response);
    }
    static created(res, data, message = 'Created successfully') {
        return this.success(res, data, message, 201);
    }
    static noContent(res, message = 'No content') {
        const response = {
            success: true,
            message,
        };
        return res.status(204).json(response);
    }
    static badRequest(res, message = 'Bad request', error) {
        return this.error(res, message, 400, error);
    }
    static unauthorized(res, message = 'Unauthorized', error) {
        return this.error(res, message, 401, error);
    }
    static forbidden(res, message = 'Forbidden', error) {
        return this.error(res, message, 403, error);
    }
    static notFound(res, message = 'Not found', error) {
        return this.error(res, message, 404, error);
    }
    static conflict(res, message = 'Conflict', error) {
        return this.error(res, message, 409, error);
    }
    static tooManyRequests(res, message = 'Too many requests', error) {
        return this.error(res, message, 429, error);
    }
    static internalError(res, message = 'Internal server error', error) {
        return this.error(res, message, 500, error);
    }
}
exports.ResponseHandler = ResponseHandler;
//# sourceMappingURL=response.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeLimiter = exports.commentLimiter = exports.searchLimiter = exports.uploadLimiter = exports.generalLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const response_1 = require("@/utils/response");
const createRateLimiter = (windowMs, max, message) => {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        message: {
            success: false,
            message,
            error: 'Rate limit exceeded'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            response_1.ResponseHandler.tooManyRequests(res, message);
        }
    });
};
exports.authLimiter = createRateLimiter(15 * 60 * 1000, 5, 'Too many authentication attempts, please try again later');
exports.generalLimiter = createRateLimiter(15 * 60 * 1000, 100, 'Too many requests, please try again later');
exports.uploadLimiter = createRateLimiter(60 * 60 * 1000, 10, 'Too many file uploads, please try again later');
exports.searchLimiter = createRateLimiter(1 * 60 * 1000, 30, 'Too many search requests, please try again later');
exports.commentLimiter = createRateLimiter(5 * 60 * 1000, 10, 'Too many comments, please try again later');
exports.likeLimiter = createRateLimiter(1 * 60 * 1000, 50, 'Too many like actions, please try again later');
//# sourceMappingURL=rateLimiter.js.map
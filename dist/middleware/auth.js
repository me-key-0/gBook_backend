"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireProfileCompletion = exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("@/models/User");
const errors_1 = require("@/utils/errors");
const response_1 = require("@/utils/response");
const logger_1 = require("@/utils/logger");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.AuthenticationError('Access token is required');
        }
        const token = authHeader.substring(7);
        if (!token) {
            throw new errors_1.AuthenticationError('Access token is required');
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await User_1.User.findById(decoded.id)
            .populate('campus college department')
            .select('-password');
        if (!user) {
            throw new errors_1.AuthenticationError('User not found');
        }
        if (!user.isActive) {
            throw new errors_1.AuthenticationError('Account is deactivated');
        }
        user.updateLastActive();
        req.user = user;
        req.userId = user._id.toString();
        next();
    }
    catch (error) {
        logger_1.logger.error('Authentication error:', error);
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return response_1.ResponseHandler.unauthorized(res, 'Invalid token');
        }
        if (error instanceof errors_1.AuthenticationError) {
            return response_1.ResponseHandler.unauthorized(res, error.message);
        }
        return response_1.ResponseHandler.internalError(res, 'Authentication failed');
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new errors_1.AuthenticationError('Authentication required');
            }
            if (!roles.includes(req.user.role)) {
                throw new errors_1.AuthorizationError('Insufficient permissions');
            }
            next();
        }
        catch (error) {
            logger_1.logger.error('Authorization error:', error);
            if (error instanceof errors_1.AuthorizationError) {
                return response_1.ResponseHandler.forbidden(res, error.message);
            }
            return response_1.ResponseHandler.unauthorized(res, 'Authorization failed');
        }
    };
};
exports.authorize = authorize;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.substring(7);
        if (!token) {
            return next();
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await User_1.User.findById(decoded.id)
            .populate('campus college department')
            .select('-password');
        if (user && user.isActive) {
            req.user = user;
            req.userId = user._id.toString();
            user.updateLastActive();
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireProfileCompletion = (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.AuthenticationError('Authentication required');
        }
        if (req.user.role === 'graduate' && !req.user.profileCompleted) {
            return response_1.ResponseHandler.forbidden(res, 'Profile completion required');
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Profile completion check error:', error);
        return response_1.ResponseHandler.forbidden(res, 'Profile completion required');
    }
};
exports.requireProfileCompletion = requireProfileCompletion;
//# sourceMappingURL=auth.js.map
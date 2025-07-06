"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = exports.validateParams = exports.validateQuery = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
const response_1 = require("@/utils/response");
const logger_1 = require("@/utils/logger");
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const errorMessage = error.details
                .map(detail => detail.message)
                .join(', ');
            logger_1.logger.warn('Validation error:', errorMessage);
            return response_1.ResponseHandler.badRequest(res, 'Validation failed', errorMessage);
        }
        req.body = value;
        next();
    };
};
exports.validate = validate;
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const errorMessage = error.details
                .map(detail => detail.message)
                .join(', ');
            logger_1.logger.warn('Query validation error:', errorMessage);
            return response_1.ResponseHandler.badRequest(res, 'Query validation failed', errorMessage);
        }
        req.query = value;
        next();
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            const errorMessage = error.details
                .map(detail => detail.message)
                .join(', ');
            logger_1.logger.warn('Params validation error:', errorMessage);
            return response_1.ResponseHandler.badRequest(res, 'Parameters validation failed', errorMessage);
        }
        req.params = value;
        next();
    };
};
exports.validateParams = validateParams;
exports.schemas = {
    register: joi_1.default.object({
        firstName: joi_1.default.string().min(2).max(50).required(),
        lastName: joi_1.default.string().min(2).max(50).required(),
        surname: joi_1.default.string().min(2).max(50).required(),
        username: joi_1.default.string().min(3).max(30).pattern(/^[a-zA-Z0-9_]+$/).required(),
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(6).required(),
        confirmPassword: joi_1.default.string().valid(joi_1.default.ref('password')).required(),
        phoneNumber: joi_1.default.string().pattern(/^\+?[\d\s-()]+$/).optional(),
        graduationYear: joi_1.default.number().min(1950).max(new Date().getFullYear() + 10).required(),
        campus: joi_1.default.string().hex().length(24).required(),
        college: joi_1.default.string().hex().length(24).required(),
        department: joi_1.default.string().hex().length(24).required(),
        role: joi_1.default.string().valid('graduate', 'guest').required()
    }),
    login: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().required()
    }),
    updateProfile: joi_1.default.object({
        firstName: joi_1.default.string().min(2).max(50).optional(),
        lastName: joi_1.default.string().min(2).max(50).optional(),
        surname: joi_1.default.string().min(2).max(50).optional(),
        quote: joi_1.default.string().max(500).optional(),
        phoneNumber: joi_1.default.string().pattern(/^\+?[\d\s-()]+$/).optional(),
        socialLinks: joi_1.default.object({
            telegram: joi_1.default.string().optional(),
            instagram: joi_1.default.string().optional(),
            tiktok: joi_1.default.string().optional(),
            youtube: joi_1.default.string().optional(),
            snapchat: joi_1.default.string().optional(),
            linkedin: joi_1.default.string().optional()
        }).optional(),
        privacySettings: joi_1.default.object({
            profileVisibility: joi_1.default.string().valid('public', 'department', 'college', 'campus', 'private').optional(),
            contactVisibility: joi_1.default.string().valid('public', 'department', 'college', 'campus', 'private').optional(),
            commentPermission: joi_1.default.string().valid('public', 'department', 'college', 'campus', 'private').optional()
        }).optional()
    }),
    createPost: joi_1.default.object({
        questionId: joi_1.default.string().hex().length(24).required(),
        answer: joi_1.default.string().min(1).max(2000).required(),
        type: joi_1.default.string().valid('lastword', 'question').optional()
    }),
    addComment: joi_1.default.object({
        text: joi_1.default.string().min(1).max(500).required()
    }),
    search: joi_1.default.object({
        q: joi_1.default.string().min(1).max(100).optional(),
        campus: joi_1.default.string().hex().length(24).optional(),
        college: joi_1.default.string().hex().length(24).optional(),
        department: joi_1.default.string().hex().length(24).optional(),
        graduationYear: joi_1.default.number().min(1950).max(new Date().getFullYear() + 10).optional(),
        role: joi_1.default.string().valid('graduate', 'guest').optional(),
        page: joi_1.default.number().min(1).default(1),
        limit: joi_1.default.number().min(1).max(100).default(20),
        sort: joi_1.default.string().valid('name', 'likes', 'views', 'recent').default('recent'),
        order: joi_1.default.string().valid('asc', 'desc').default('desc')
    }),
    createReport: joi_1.default.object({
        type: joi_1.default.string().valid('inappropriate_content', 'harassment', 'spam', 'fake_profile', 'other').required(),
        reason: joi_1.default.string().min(10).max(500).required(),
        description: joi_1.default.string().max(1000).optional()
    }),
    tagUser: joi_1.default.object({
        tagIds: joi_1.default.array().items(joi_1.default.string().hex().length(24)).min(1).required()
    }),
    objectId: joi_1.default.object({
        id: joi_1.default.string().hex().length(24).required()
    }),
    pagination: joi_1.default.object({
        page: joi_1.default.number().min(1).default(1),
        limit: joi_1.default.number().min(1).max(100).default(20)
    }),
    privacySettings: joi_1.default.object({
        privacySettings: joi_1.default.object({
            profileVisibility: joi_1.default.string().valid('public', 'department', 'college', 'campus', 'private').required(),
            contactVisibility: joi_1.default.string().valid('public', 'department', 'college', 'campus', 'private').required(),
            commentPermission: joi_1.default.string().valid('public', 'department', 'college', 'campus', 'private').required(),
            excludedUsers: joi_1.default.array().items(joi_1.default.string().hex().length(24)).optional()
        }).required()
    })
};
//# sourceMappingURL=validation.js.map
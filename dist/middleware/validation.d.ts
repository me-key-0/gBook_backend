import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare const validate: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateQuery: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateParams: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const schemas: {
    register: Joi.ObjectSchema<any>;
    login: Joi.ObjectSchema<any>;
    updateProfile: Joi.ObjectSchema<any>;
    createPost: Joi.ObjectSchema<any>;
    addComment: Joi.ObjectSchema<any>;
    search: Joi.ObjectSchema<any>;
    createReport: Joi.ObjectSchema<any>;
    tagUser: Joi.ObjectSchema<any>;
    objectId: Joi.ObjectSchema<any>;
    pagination: Joi.ObjectSchema<any>;
    privacySettings: Joi.ObjectSchema<any>;
};
//# sourceMappingURL=validation.d.ts.map
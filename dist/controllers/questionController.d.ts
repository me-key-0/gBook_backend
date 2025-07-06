import { Request, Response } from 'express';
declare class QuestionController {
    getQuestions: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getQuestionsByType: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getQuestionsByCategory: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getRequiredQuestions: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getRandomQuestions: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getQuestionCategories: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getQuestion: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createQuestion: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateQuestion: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteQuestion: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const questionController: QuestionController;
export {};
//# sourceMappingURL=questionController.d.ts.map
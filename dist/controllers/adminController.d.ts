import { Request, Response } from 'express';
declare class AdminController {
    getAllUsers: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deactivateUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
    activateUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getReports: (req: Request, res: Response, next: import("express").NextFunction) => void;
    reviewReport: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getQuestions: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createQuestion: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateQuestion: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteQuestion: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getTags: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createTag: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateTag: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteTag: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createCampus: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createCollege: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createDepartment: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getAnalytics: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const adminController: AdminController;
export {};
//# sourceMappingURL=adminController.d.ts.map
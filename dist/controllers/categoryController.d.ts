import { Request, Response } from 'express';
declare class CategoryController {
    getAllCampuses: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getCampusColleges: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getCollegeDepartments: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getDepartmentUsers: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getCampusStats: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getCollegeStats: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getAcademicStructure: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const categoryController: CategoryController;
export {};
//# sourceMappingURL=categoryController.d.ts.map
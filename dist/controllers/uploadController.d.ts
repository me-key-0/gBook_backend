import { Request, Response } from 'express';
declare class UploadController {
    uploadProfilePhoto: (req: Request, res: Response, next: import("express").NextFunction) => void;
    uploadCoverImage: (req: Request, res: Response, next: import("express").NextFunction) => void;
    uploadPostImage: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteImage: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const uploadController: UploadController;
export {};
//# sourceMappingURL=uploadController.d.ts.map
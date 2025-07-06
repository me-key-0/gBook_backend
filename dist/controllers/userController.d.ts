import { Request, Response } from 'express';
declare class UserController {
    getProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    likeProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    saveProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    commentOnProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getProfileComments: (req: Request, res: Response, next: import("express").NextFunction) => void;
    tagUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
    reportUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getLikedProfiles: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getSavedProfiles: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updatePrivacySettings: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getSuggestedUsers: (req: Request, res: Response, next: import("express").NextFunction) => void;
    private checkProfileVisibility;
    private checkCommentPermission;
    private checkContactVisibility;
    private getMutualConnectionsCount;
}
export declare const userController: UserController;
export {};
//# sourceMappingURL=userController.d.ts.map
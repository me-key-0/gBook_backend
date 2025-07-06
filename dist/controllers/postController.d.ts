import { Request, Response } from 'express';
declare class PostController {
    createPost: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getPosts: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getPost: (req: Request, res: Response, next: import("express").NextFunction) => void;
    likePost: (req: Request, res: Response, next: import("express").NextFunction) => void;
    savePost: (req: Request, res: Response, next: import("express").NextFunction) => void;
    commentOnPost: (req: Request, res: Response, next: import("express").NextFunction) => void;
    sharePost: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deletePost: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getUserPosts: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getSavedPosts: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getLikedPosts: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getPopularPosts: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getLastWords: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const postController: PostController;
export {};
//# sourceMappingURL=postController.d.ts.map
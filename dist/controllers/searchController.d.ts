import { Request, Response } from 'express';
declare class SearchController {
    searchUsers: (req: Request, res: Response, next: import("express").NextFunction) => void;
    searchPosts: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getSuggestedUsers: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getSearchFilters: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getPopularSearches: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getQuickSearch: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getRecentSearches: (req: Request, res: Response, next: import("express").NextFunction) => void;
    saveSearch: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const searchController: SearchController;
export {};
//# sourceMappingURL=searchController.d.ts.map
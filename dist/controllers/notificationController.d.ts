import { Request, Response } from 'express';
declare class NotificationController {
    getNotifications: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getUnreadCount: (req: Request, res: Response, next: import("express").NextFunction) => void;
    markAsRead: (req: Request, res: Response, next: import("express").NextFunction) => void;
    markAllAsRead: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteNotification: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getNotificationSettings: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateNotificationSettings: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const notificationController: NotificationController;
export {};
//# sourceMappingURL=notificationController.d.ts.map
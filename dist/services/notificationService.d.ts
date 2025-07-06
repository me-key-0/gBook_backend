import { INotification } from '@/types';
declare class NotificationService {
    createNotification(data: {
        userId: string;
        type: string;
        fromUserId: string;
        targetId?: string;
        message: string;
    }): Promise<INotification>;
    getNotifications(userId: string, page?: number, limit?: number, unreadOnly?: boolean): Promise<{
        notifications: INotification[];
        total: number;
        unreadCount: number;
    }>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    deleteNotification(notificationId: string, userId: string): Promise<void>;
    notifyProfileLike(likedUserId: string, likerUserId: string): Promise<void>;
    notifyProfileComment(profileUserId: string, commenterUserId: string): Promise<void>;
    notifyPostLike(postOwnerId: string, likerUserId: string, postId: string): Promise<void>;
    notifyPostComment(postOwnerId: string, commenterUserId: string, postId: string): Promise<void>;
    notifyUserTag(taggedUserId: string, taggerUserId: string): Promise<void>;
    notifyPostShare(postOwnerId: string, sharerUserId: string, postId: string): Promise<void>;
}
export declare const notificationService: NotificationService;
export {};
//# sourceMappingURL=notificationService.d.ts.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const Notification_1 = require("@/models/Notification");
const User_1 = require("@/models/User");
const socketService_1 = require("./socketService");
const logger_1 = require("@/utils/logger");
class NotificationService {
    async createNotification(data) {
        try {
            const notification = await Notification_1.Notification.create(data);
            await notification.populate('fromUser', 'firstName lastName surname username photo');
            const payload = {
                type: data.type,
                message: data.message,
                data: notification,
                userId: data.userId,
                fromUserId: data.fromUserId
            };
            socketService_1.socketService.sendNotification(payload);
            logger_1.logger.info(`Notification created for user ${data.userId}: ${data.message}`);
            return notification;
        }
        catch (error) {
            logger_1.logger.error('Error creating notification:', error);
            throw error;
        }
    }
    async getNotifications(userId, page = 1, limit = 20, unreadOnly = false) {
        try {
            const filter = { user: userId };
            if (unreadOnly) {
                filter.isRead = false;
            }
            const [notifications, total, unreadCount] = await Promise.all([
                Notification_1.Notification.find(filter)
                    .populate('fromUser', 'firstName lastName surname username photo')
                    .sort({ createdAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit),
                Notification_1.Notification.countDocuments(filter),
                Notification_1.Notification.countDocuments({ user: userId, isRead: false })
            ]);
            return { notifications, total, unreadCount };
        }
        catch (error) {
            logger_1.logger.error('Error fetching notifications:', error);
            throw error;
        }
    }
    async markAsRead(notificationId, userId) {
        try {
            await Notification_1.Notification.findOneAndUpdate({ _id: notificationId, user: userId }, { isRead: true });
            logger_1.logger.info(`Notification ${notificationId} marked as read`);
        }
        catch (error) {
            logger_1.logger.error('Error marking notification as read:', error);
            throw error;
        }
    }
    async markAllAsRead(userId) {
        try {
            await Notification_1.Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
            logger_1.logger.info(`All notifications marked as read for user ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Error marking all notifications as read:', error);
            throw error;
        }
    }
    async deleteNotification(notificationId, userId) {
        try {
            await Notification_1.Notification.findOneAndDelete({
                _id: notificationId,
                user: userId
            });
            logger_1.logger.info(`Notification ${notificationId} deleted`);
        }
        catch (error) {
            logger_1.logger.error('Error deleting notification:', error);
            throw error;
        }
    }
    async notifyProfileLike(likedUserId, likerUserId) {
        const liker = await User_1.User.findById(likerUserId).select('firstName lastName surname');
        if (!liker)
            return;
        await this.createNotification({
            userId: likedUserId,
            type: 'like',
            fromUserId: likerUserId,
            message: `${liker.firstName} ${liker.lastName} liked your profile`
        });
    }
    async notifyProfileComment(profileUserId, commenterUserId) {
        const commenter = await User_1.User.findById(commenterUserId).select('firstName lastName surname');
        if (!commenter)
            return;
        await this.createNotification({
            userId: profileUserId,
            type: 'comment',
            fromUserId: commenterUserId,
            message: `${commenter.firstName} ${commenter.lastName} commented on your profile`
        });
    }
    async notifyPostLike(postOwnerId, likerUserId, postId) {
        const liker = await User_1.User.findById(likerUserId).select('firstName lastName surname');
        if (!liker)
            return;
        await this.createNotification({
            userId: postOwnerId,
            type: 'post_like',
            fromUserId: likerUserId,
            targetId: postId,
            message: `${liker.firstName} ${liker.lastName} liked your post`
        });
    }
    async notifyPostComment(postOwnerId, commenterUserId, postId) {
        const commenter = await User_1.User.findById(commenterUserId).select('firstName lastName surname');
        if (!commenter)
            return;
        await this.createNotification({
            userId: postOwnerId,
            type: 'post_comment',
            fromUserId: commenterUserId,
            targetId: postId,
            message: `${commenter.firstName} ${commenter.lastName} commented on your post`
        });
    }
    async notifyUserTag(taggedUserId, taggerUserId) {
        const tagger = await User_1.User.findById(taggerUserId).select('firstName lastName surname');
        if (!tagger)
            return;
        await this.createNotification({
            userId: taggedUserId,
            type: 'tag',
            fromUserId: taggerUserId,
            message: `${tagger.firstName} ${tagger.lastName} tagged you`
        });
    }
    async notifyPostShare(postOwnerId, sharerUserId, postId) {
        const sharer = await User_1.User.findById(sharerUserId).select('firstName lastName surname');
        if (!sharer)
            return;
        await this.createNotification({
            userId: postOwnerId,
            type: 'share',
            fromUserId: sharerUserId,
            targetId: postId,
            message: `${sharer.firstName} ${sharer.lastName} shared your post`
        });
    }
}
exports.notificationService = new NotificationService();
//# sourceMappingURL=notificationService.js.map
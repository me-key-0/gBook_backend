"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = void 0;
const response_1 = require("@/utils/response");
const logger_1 = require("@/utils/logger");
const errorHandler_1 = require("@/middleware/errorHandler");
const notificationService_1 = require("@/services/notificationService");
class NotificationController {
    constructor() {
        this.getNotifications = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const currentUserId = req.userId;
            const { page = 1, limit = 20, unreadOnly = false } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const unreadOnlyBool = unreadOnly === 'true';
            const result = await notificationService_1.notificationService.getNotifications(currentUserId, pageNum, limitNum, unreadOnlyBool);
            response_1.ResponseHandler.paginated(res, result.notifications, {
                page: pageNum,
                limit: limitNum,
                total: result.total,
                pages: Math.ceil(result.total / limitNum)
            }, 'Notifications retrieved successfully');
        });
        this.getUnreadCount = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const currentUserId = req.userId;
            const result = await notificationService_1.notificationService.getNotifications(currentUserId, 1, 1, true);
            response_1.ResponseHandler.success(res, {
                unreadCount: result.unreadCount
            }, 'Unread count retrieved successfully');
        });
        this.markAsRead = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const currentUserId = req.userId;
            await notificationService_1.notificationService.markAsRead(id, currentUserId);
            response_1.ResponseHandler.success(res, null, 'Notification marked as read');
        });
        this.markAllAsRead = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const currentUserId = req.userId;
            await notificationService_1.notificationService.markAllAsRead(currentUserId);
            response_1.ResponseHandler.success(res, null, 'All notifications marked as read');
        });
        this.deleteNotification = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const currentUserId = req.userId;
            await notificationService_1.notificationService.deleteNotification(id, currentUserId);
            response_1.ResponseHandler.success(res, null, 'Notification deleted successfully');
        });
        this.getNotificationSettings = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const currentUserId = req.userId;
            const settings = {
                profileLikes: true,
                profileComments: true,
                postLikes: true,
                postComments: true,
                postShares: true,
                tags: true,
                emailNotifications: false,
                pushNotifications: true
            };
            response_1.ResponseHandler.success(res, settings, 'Notification settings retrieved successfully');
        });
        this.updateNotificationSettings = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const currentUserId = req.userId;
            const settings = req.body;
            logger_1.logger.info(`Notification settings updated for user ${currentUserId}:`, settings);
            response_1.ResponseHandler.success(res, settings, 'Notification settings updated successfully');
        });
    }
}
exports.notificationController = new NotificationController();
//# sourceMappingURL=notificationController.js.map
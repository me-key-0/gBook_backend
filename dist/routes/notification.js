"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("@/controllers/notificationController");
const auth_1 = require("@/middleware/auth");
const validation_1 = require("@/middleware/validation");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', (0, validation_1.validateQuery)(validation_1.schemas.pagination), notificationController_1.notificationController.getNotifications);
router.get('/unread-count', notificationController_1.notificationController.getUnreadCount);
router.put('/:id/read', (0, validation_1.validateParams)(validation_1.schemas.objectId), notificationController_1.notificationController.markAsRead);
router.put('/mark-all-read', notificationController_1.notificationController.markAllAsRead);
router.delete('/:id', (0, validation_1.validateParams)(validation_1.schemas.objectId), notificationController_1.notificationController.deleteNotification);
router.get('/settings', notificationController_1.notificationController.getNotificationSettings);
router.put('/settings', notificationController_1.notificationController.updateNotificationSettings);
exports.default = router;
//# sourceMappingURL=notification.js.map
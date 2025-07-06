"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketService = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("@/models/User");
const logger_1 = require("@/utils/logger");
class SocketService {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map();
    }
    initialize(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "*",
                methods: ["GET", "POST"],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });
        this.setupMiddleware();
        this.setupEventHandlers();
        logger_1.logger.info('✅ Socket.IO initialized successfully');
    }
    setupMiddleware() {
        if (!this.io)
            return;
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
                if (!token) {
                    return next(new Error('Authentication error: No token provided'));
                }
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                const user = await User_1.User.findById(decoded.id).select('-password');
                if (!user || !user.isActive) {
                    return next(new Error('Authentication error: Invalid user'));
                }
                socket.data.user = user;
                next();
            }
            catch (error) {
                next(new Error('Authentication error: Invalid token'));
            }
        });
    }
    setupEventHandlers() {
        if (!this.io)
            return;
        this.io.on('connection', (socket) => {
            const user = socket.data.user;
            this.connectedUsers.set(user._id.toString(), {
                userId: user._id.toString(),
                socketId: socket.id,
                isOnline: true,
                lastSeen: new Date()
            });
            socket.join(`user:${user._id}`);
            if (user.department)
                socket.join(`department:${user.department}`);
            if (user.college)
                socket.join(`college:${user.college}`);
            if (user.campus)
                socket.join(`campus:${user.campus}`);
            logger_1.logger.info(`User ${user.username} connected with socket ${socket.id}`);
            this.broadcastUserStatus(user._id.toString(), true);
            this.handleRealtimeEvents(socket);
            socket.on('disconnect', () => {
                this.connectedUsers.delete(user._id.toString());
                this.broadcastUserStatus(user._id.toString(), false);
                logger_1.logger.info(`User ${user.username} disconnected`);
            });
        });
    }
    handleRealtimeEvents(socket) {
        const user = socket.data.user;
        socket.on('typing:start', (data) => {
            socket.to(`user:${data.targetUserId}`).emit('typing:start', {
                userId: user._id,
                username: user.username
            });
        });
        socket.on('typing:stop', (data) => {
            socket.to(`user:${data.targetUserId}`).emit('typing:stop', {
                userId: user._id,
                username: user.username
            });
        });
        socket.on('profile:view', (data) => {
            socket.to(`user:${data.profileId}`).emit('profile:viewed', {
                viewerId: user._id,
                viewerName: user.fullName,
                timestamp: new Date()
            });
        });
        socket.on('counter:request', (data) => {
            this.emitCounterUpdate(data.type, data.targetId);
        });
    }
    sendNotification(notification) {
        if (!this.io)
            return;
        this.io.to(`user:${notification.userId}`).emit('notification', notification);
        logger_1.logger.info(`Notification sent to user ${notification.userId}: ${notification.message}`);
    }
    sendToUser(userId, event, data) {
        if (!this.io)
            return;
        this.io.to(`user:${userId}`).emit(event, data);
    }
    sendToDepartment(departmentId, event, data) {
        if (!this.io)
            return;
        this.io.to(`department:${departmentId}`).emit(event, data);
    }
    sendToCollege(collegeId, event, data) {
        if (!this.io)
            return;
        this.io.to(`college:${collegeId}`).emit(event, data);
    }
    sendToCampus(campusId, event, data) {
        if (!this.io)
            return;
        this.io.to(`campus:${campusId}`).emit(event, data);
    }
    broadcastUserStatus(userId, isOnline) {
        if (!this.io)
            return;
        this.io.emit('user:status', {
            userId,
            isOnline,
            lastSeen: new Date()
        });
    }
    emitCounterUpdate(type, targetId) {
        if (!this.io)
            return;
        this.io.emit('counter:update', {
            type,
            targetId,
            timestamp: new Date()
        });
    }
    getConnectedUsers() {
        return Array.from(this.connectedUsers.values());
    }
    isUserOnline(userId) {
        return this.connectedUsers.has(userId);
    }
    getSocketIO() {
        return this.io;
    }
}
exports.socketService = new SocketService();
//# sourceMappingURL=socketService.js.map
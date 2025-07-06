import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { NotificationPayload, SocketUser } from '@/types';
declare class SocketService {
    private io;
    private connectedUsers;
    initialize(server: HTTPServer): void;
    private setupMiddleware;
    private setupEventHandlers;
    private handleRealtimeEvents;
    sendNotification(notification: NotificationPayload): void;
    sendToUser(userId: string, event: string, data: any): void;
    sendToDepartment(departmentId: string, event: string, data: any): void;
    sendToCollege(collegeId: string, event: string, data: any): void;
    sendToCampus(campusId: string, event: string, data: any): void;
    broadcastUserStatus(userId: string, isOnline: boolean): void;
    emitCounterUpdate(type: string, targetId: string): void;
    getConnectedUsers(): SocketUser[];
    isUserOnline(userId: string): boolean;
    getSocketIO(): SocketIOServer | null;
}
export declare const socketService: SocketService;
export {};
//# sourceMappingURL=socketService.d.ts.map
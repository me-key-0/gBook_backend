"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const http_1 = require("http");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const database_1 = require("./config/database");
const firebase_1 = require("@/config/firebase");
const logger_1 = require("@/utils/logger");
const errorHandler_1 = require("@/middleware/errorHandler");
const rateLimiter_1 = require("@/middleware/rateLimiter");
const socketService_1 = require("@/services/socketService");
const auth_1 = __importDefault(require("@/routes/auth"));
const user_1 = __importDefault(require("@/routes/user"));
const post_1 = __importDefault(require("@/routes/post"));
const search_1 = __importDefault(require("@/routes/search"));
const notification_1 = __importDefault(require("@/routes/notification"));
const upload_1 = __importDefault(require("@/routes/upload"));
const admin_1 = __importDefault(require("@/routes/admin"));
const category_1 = __importDefault(require("@/routes/category"));
const question_1 = __importDefault(require("@/routes/question"));
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = parseInt(process.env.PORT || "3000", 10);
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddleware() {
        this.app.use((0, helmet_1.default)({
            crossOriginResourcePolicy: { policy: "cross-origin" },
        }));
        this.app.use((0, cors_1.default)({
            origin: process.env.FRONTEND_URL || "*",
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        }));
        this.app.use((0, compression_1.default)());
        this.app.use(express_1.default.json({ limit: "10mb" }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
        this.app.use(rateLimiter_1.generalLimiter);
        this.app.use((req, res, next) => {
            logger_1.logger.info(`${req.method} ${req.path} - ${req.ip}`);
            next();
        });
    }
    initializeRoutes() {
        this.app.get("/health", (req, res) => {
            res.status(200).json({
                success: true,
                message: "GradBook API is running",
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || "development",
            });
        });
        this.app.use("/api/v1/auth", auth_1.default);
        this.app.use("/api/v1/users", user_1.default);
        this.app.use("/api/v1/posts", post_1.default);
        this.app.use("/api/v1/search", search_1.default);
        this.app.use("/api/v1/notifications", notification_1.default);
        this.app.use("/api/v1/upload", upload_1.default);
        this.app.use("/api/v1/admin", admin_1.default);
        this.app.use("/api/v1/categories", category_1.default);
        this.app.use("/api/v1/questions", question_1.default);
    }
    initializeErrorHandling() {
        this.app.use(errorHandler_1.notFoundHandler);
        this.app.use(errorHandler_1.errorHandler);
    }
    async start() {
        try {
            await database_1.database.connect();
            firebase_1.firebaseService.initialize();
            this.server = (0, http_1.createServer)(this.app);
            socketService_1.socketService.initialize(this.server);
            this.server.listen(this.port, () => {
                logger_1.logger.info(`🚀 GradBook API server running on port ${this.port}`);
                logger_1.logger.info(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
                logger_1.logger.info(`🌐 Health check: http://localhost:${this.port}/health`);
            });
            this.setupGracefulShutdown();
        }
        catch (error) {
            logger_1.logger.error("❌ Failed to start server:", error);
            process.exit(1);
        }
    }
    setupGracefulShutdown() {
        const gracefulShutdown = async (signal) => {
            logger_1.logger.info(`📴 Received ${signal}. Starting graceful shutdown...`);
            if (this.server) {
                this.server.close(async () => {
                    logger_1.logger.info("🔌 HTTP server closed");
                    try {
                        await database_1.database.disconnect();
                        logger_1.logger.info("🗄️ Database disconnected");
                        logger_1.logger.info("✅ Graceful shutdown completed");
                        process.exit(0);
                    }
                    catch (error) {
                        logger_1.logger.error("❌ Error during shutdown:", error);
                        process.exit(1);
                    }
                });
            }
        };
        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    }
}
const server = new Server();
server.start().catch((error) => {
    logger_1.logger.error("❌ Failed to start application:", error);
    process.exit(1);
});
exports.default = server;
//# sourceMappingURL=server.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("@/utils/logger");
class Database {
    constructor() {
        this.isConnected = false;
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async connect() {
        if (this.isConnected) {
            logger_1.logger.info("Database already connected");
            return;
        }
        try {
            const mongoUri = process.env.MONGODB_URI;
            if (!mongoUri) {
                throw new Error("MONGODB_URI environment variable is not defined");
            }
            const options = {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                bufferCommands: false,
            };
            await mongoose_1.default.connect(mongoUri, options);
            this.isConnected = true;
            logger_1.logger.info("✅ Database connected successfully");
            mongoose_1.default.connection.on("error", (error) => {
                logger_1.logger.error("Database connection error:", error);
                this.isConnected = false;
            });
            mongoose_1.default.connection.on("disconnected", () => {
                logger_1.logger.warn("Database disconnected");
                this.isConnected = false;
            });
            mongoose_1.default.connection.on("reconnected", () => {
                logger_1.logger.info("Database reconnected");
                this.isConnected = true;
            });
        }
        catch (error) {
            logger_1.logger.error("❌ Database connection failed:", error);
            this.isConnected = false;
            throw error;
        }
    }
    async disconnect() {
        if (!this.isConnected) {
            return;
        }
        try {
            await mongoose_1.default.disconnect();
            this.isConnected = false;
            logger_1.logger.info("Database disconnected successfully");
        }
        catch (error) {
            logger_1.logger.error("Error disconnecting from database:", error);
            throw error;
        }
    }
    isConnectionActive() {
        return this.isConnected && mongoose_1.default.connection.readyState === 1;
    }
    getConnectionState() {
        const states = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting",
        };
        return (states[mongoose_1.default.connection.readyState] || "unknown");
    }
}
exports.database = Database.getInstance();
//# sourceMappingURL=database.js.map
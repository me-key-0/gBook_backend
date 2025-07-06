"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const reportSchema = new mongoose_1.Schema({
    reporter: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Reporter is required"],
    },
    reported: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Reported user is required"],
    },
    type: {
        type: String,
        enum: [
            "inappropriate_content",
            "harassment",
            "spam",
            "fake_profile",
            "other",
        ],
        required: [true, "Report type is required"],
    },
    reason: {
        type: String,
        required: [true, "Reason is required"],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
        type: String,
        enum: ["pending", "reviewed", "resolved", "dismissed"],
        default: "pending",
    },
    reviewedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    reviewedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
exports.Report = mongoose_1.default.model("Report", reportSchema);
//# sourceMappingURL=Report.js.map
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
exports.Post = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const postCommentSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        required: [true, "Comment text is required"],
        trim: true,
        maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const postSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
    },
    question: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Question",
        required: [true, "Question is required"],
    },
    answer: {
        type: String,
        required: [true, "Answer is required"],
        trim: true,
        maxlength: [2000, "Answer cannot exceed 2000 characters"],
    },
    type: {
        type: String,
        enum: ["lastword", "question"],
        required: [true, "Post type is required"],
        default: "question",
    },
    likes: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    comments: [postCommentSchema],
    shares: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    views: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
postSchema.virtual("likesCount").get(function () {
    return this.likes?.length || 0;
});
postSchema.virtual("commentsCount").get(function () {
    return this.comments?.length || 0;
});
postSchema.virtual("sharesCount").get(function () {
    return this.shares?.length || 0;
});
postSchema.methods.addLike = function (userId) {
    if (!this.likes.includes(userId)) {
        this.likes.push(userId);
    }
    return this.save();
};
postSchema.methods.removeLike = function (userId) {
    this.likes = this.likes.filter((id) => id.toString() !== userId);
    return this.save();
};
postSchema.methods.addComment = function (userId, text) {
    this.comments.push({ user: userId, text });
    return this.save();
};
postSchema.methods.incrementViews = function () {
    this.views += 1;
    return this.save({ validateBeforeSave: false });
};
exports.Post = mongoose_1.default.model("Post", postSchema);
//# sourceMappingURL=Post.js.map
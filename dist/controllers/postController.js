"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postController = void 0;
const Post_1 = require("@/models/Post");
const Question_1 = require("@/models/Question");
const User_1 = require("@/models/User");
const response_1 = require("@/utils/response");
const errors_1 = require("@/utils/errors");
const logger_1 = require("@/utils/logger");
const errorHandler_1 = require("@/middleware/errorHandler");
const notificationService_1 = require("@/services/notificationService");
const personalizationService_1 = require("@/services/personalizationService");
class PostController {
    constructor() {
        this.createPost = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { questionId, answer, type = 'question' } = req.body;
            const currentUserId = req.userId;
            const question = await Question_1.Question.findOne({ _id: questionId, isActive: true });
            if (!question) {
                throw new errors_1.NotFoundError('Question not found');
            }
            const user = await User_1.User.findById(currentUserId);
            if (!user || user.role !== 'graduate') {
                throw new errors_1.AuthorizationError('Only graduates can create posts');
            }
            const post = await Post_1.Post.create({
                user: currentUserId,
                question: questionId,
                answer: answer.trim(),
                type
            });
            await post.populate([
                {
                    path: 'user',
                    select: 'firstName lastName surname username photo campus college department'
                },
                {
                    path: 'question',
                    select: 'question type category'
                }
            ]);
            logger_1.logger.info(`Post created by user ${currentUserId}: ${post._id}`);
            response_1.ResponseHandler.created(res, post, 'Post created successfully');
        });
        this.getPosts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const currentUserId = req.userId;
            const { page = 1, limit = 20, type, userId } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const filter = { isActive: true };
            if (type)
                filter.type = type;
            if (userId)
                filter.user = userId;
            let posts;
            let total;
            if (currentUserId && !userId) {
                const personalizedResult = await personalizationService_1.personalizationService.getPersonalizedFeed(currentUserId, pageNum, limitNum);
                posts = personalizedResult.posts;
                total = personalizedResult.total;
            }
            else {
                posts = await Post_1.Post.find(filter)
                    .populate([
                    {
                        path: 'user',
                        select: 'firstName lastName surname username photo campus college department'
                    },
                    {
                        path: 'question',
                        select: 'question type category'
                    }
                ])
                    .sort({ createdAt: -1 })
                    .skip((pageNum - 1) * limitNum)
                    .limit(limitNum);
                total = await Post_1.Post.countDocuments(filter);
            }
            if (currentUserId) {
                const user = await User_1.User.findById(currentUserId);
                posts = posts.map((post) => ({
                    ...post.toJSON(),
                    isLiked: post.likes.includes(currentUserId),
                    isSaved: user?.savedPosts.includes(post._id) || false,
                    likesCount: post.likes.length,
                    commentsCount: post.comments.length,
                    sharesCount: post.shares.length
                }));
            }
            response_1.ResponseHandler.paginated(res, posts, {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }, 'Posts retrieved successfully');
        });
        this.getPost = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const currentUserId = req.userId;
            const post = await Post_1.Post.findOne({ _id: id, isActive: true })
                .populate([
                {
                    path: 'user',
                    select: 'firstName lastName surname username photo campus college department'
                },
                {
                    path: 'question',
                    select: 'question type category'
                },
                {
                    path: 'comments.user',
                    select: 'firstName lastName surname username photo'
                }
            ]);
            if (!post) {
                throw new errors_1.NotFoundError('Post not found');
            }
            if (currentUserId && post.user._id.toString() !== currentUserId) {
                await post.incrementViews();
                await personalizationService_1.personalizationService.updateUserInteraction(currentUserId, 'view', id, 'post');
            }
            let postResponse = post.toJSON();
            if (currentUserId) {
                const user = await User_1.User.findById(currentUserId);
                postResponse = {
                    ...postResponse,
                    isLiked: post.likes.includes(currentUserId),
                    isSaved: user?.savedPosts.includes(post._id) || false,
                    likesCount: post.likes.length,
                    commentsCount: post.comments.length,
                    sharesCount: post.shares.length
                };
            }
            response_1.ResponseHandler.success(res, postResponse, 'Post retrieved successfully');
        });
        this.likePost = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const currentUserId = req.userId;
            const post = await Post_1.Post.findOne({ _id: id, isActive: true });
            if (!post) {
                throw new errors_1.NotFoundError('Post not found');
            }
            if (post.user.toString() === currentUserId) {
                throw new errors_1.ValidationError('Cannot like your own post');
            }
            const isAlreadyLiked = post.likes.includes(currentUserId);
            if (isAlreadyLiked) {
                await post.removeLike(currentUserId);
            }
            else {
                await post.addLike(currentUserId);
                await notificationService_1.notificationService.notifyPostLike(post.user.toString(), currentUserId, id);
                await personalizationService_1.personalizationService.updateUserInteraction(currentUserId, 'like', id, 'post');
            }
            response_1.ResponseHandler.success(res, {
                isLiked: !isAlreadyLiked,
                likesCount: post.likes.length
            }, isAlreadyLiked ? 'Post unliked' : 'Post liked');
        });
        this.savePost = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const currentUserId = req.userId;
            const [post, user] = await Promise.all([
                Post_1.Post.findOne({ _id: id, isActive: true }),
                User_1.User.findById(currentUserId)
            ]);
            if (!post) {
                throw new errors_1.NotFoundError('Post not found');
            }
            if (!user) {
                throw new errors_1.NotFoundError('User not found');
            }
            const isAlreadySaved = user.savedPosts.includes(post._id);
            if (isAlreadySaved) {
                user.savedPosts = user.savedPosts.filter(postId => postId.toString() !== id);
            }
            else {
                user.savedPosts.push(post._id);
            }
            await user.save();
            response_1.ResponseHandler.success(res, {
                isSaved: !isAlreadySaved
            }, isAlreadySaved ? 'Post unsaved' : 'Post saved');
        });
        this.commentOnPost = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { text } = req.body;
            const currentUserId = req.userId;
            const post = await Post_1.Post.findOne({ _id: id, isActive: true });
            if (!post) {
                throw new errors_1.NotFoundError('Post not found');
            }
            await post.addComment(currentUserId, text.trim());
            if (post.user.toString() !== currentUserId) {
                await notificationService_1.notificationService.notifyPostComment(post.user.toString(), currentUserId, id);
            }
            await personalizationService_1.personalizationService.updateUserInteraction(currentUserId, 'comment', id, 'post');
            const updatedPost = await Post_1.Post.findById(id)
                .populate('comments.user', 'firstName lastName surname username photo');
            const newComment = updatedPost.comments[updatedPost.comments.length - 1];
            response_1.ResponseHandler.created(res, newComment, 'Comment added successfully');
        });
        this.sharePost = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const currentUserId = req.userId;
            const post = await Post_1.Post.findOne({ _id: id, isActive: true });
            if (!post) {
                throw new errors_1.NotFoundError('Post not found');
            }
            if (post.user.toString() === currentUserId) {
                throw new errors_1.ValidationError('Cannot share your own post');
            }
            const isAlreadyShared = post.shares.includes(currentUserId);
            if (isAlreadyShared) {
                throw new errors_1.ValidationError('Post already shared');
            }
            post.shares.push(currentUserId);
            await post.save();
            await notificationService_1.notificationService.notifyPostShare(post.user.toString(), currentUserId, id);
            await personalizationService_1.personalizationService.updateUserInteraction(currentUserId, 'share', id, 'post');
            response_1.ResponseHandler.success(res, {
                sharesCount: post.shares.length
            }, 'Post shared successfully');
        });
        this.deletePost = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const currentUserId = req.userId;
            const post = await Post_1.Post.findOne({ _id: id, isActive: true });
            if (!post) {
                throw new errors_1.NotFoundError('Post not found');
            }
            if (post.user.toString() !== currentUserId) {
                throw new errors_1.AuthorizationError('You can only delete your own posts');
            }
            post.isActive = false;
            await post.save();
            logger_1.logger.info(`Post ${id} deleted by user ${currentUserId}`);
            response_1.ResponseHandler.success(res, null, 'Post deleted successfully');
        });
        this.getUserPosts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { userId } = req.params;
            const { page = 1, limit = 20, type } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const user = await User_1.User.findById(userId);
            if (!user || !user.isActive) {
                throw new errors_1.NotFoundError('User not found');
            }
            const filter = { user: userId, isActive: true };
            if (type)
                filter.type = type;
            const posts = await Post_1.Post.find(filter)
                .populate([
                {
                    path: 'user',
                    select: 'firstName lastName surname username photo'
                },
                {
                    path: 'question',
                    select: 'question type category'
                }
            ])
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum);
            const total = await Post_1.Post.countDocuments(filter);
            response_1.ResponseHandler.paginated(res, posts, {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }, 'User posts retrieved successfully');
        });
        this.getSavedPosts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const currentUserId = req.userId;
            const { page = 1, limit = 20 } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const user = await User_1.User.findById(currentUserId)
                .populate({
                path: 'savedPosts',
                match: { isActive: true },
                populate: [
                    {
                        path: 'user',
                        select: 'firstName lastName surname username photo'
                    },
                    {
                        path: 'question',
                        select: 'question type category'
                    }
                ],
                options: {
                    sort: { createdAt: -1 },
                    skip: (pageNum - 1) * limitNum,
                    limit: limitNum
                }
            });
            if (!user) {
                throw new errors_1.NotFoundError('User not found');
            }
            const total = user.savedPosts.length;
            response_1.ResponseHandler.paginated(res, user.savedPosts, {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }, 'Saved posts retrieved successfully');
        });
        this.getLikedPosts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const currentUserId = req.userId;
            const { page = 1, limit = 20 } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const user = await User_1.User.findById(currentUserId);
            if (!user) {
                throw new errors_1.NotFoundError('User not found');
            }
            const posts = await Post_1.Post.find({
                _id: { $in: user.likedPosts },
                isActive: true
            })
                .populate([
                {
                    path: 'user',
                    select: 'firstName lastName surname username photo'
                },
                {
                    path: 'question',
                    select: 'question type category'
                }
            ])
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum);
            const total = user.likedPosts.length;
            response_1.ResponseHandler.paginated(res, posts, {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }, 'Liked posts retrieved successfully');
        });
        this.getPopularPosts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { timeframe = 'week', limit = 20 } = req.query;
            const posts = await personalizationService_1.personalizationService.getPopularContent(timeframe, parseInt(limit));
            response_1.ResponseHandler.success(res, posts, 'Popular posts retrieved successfully');
        });
        this.getLastWords = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const currentUserId = req.userId;
            const { page = 1, limit = 20 } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const posts = await Post_1.Post.find({
                type: 'lastword',
                isActive: true
            })
                .populate([
                {
                    path: 'user',
                    select: 'firstName lastName surname username photo campus college department'
                },
                {
                    path: 'question',
                    select: 'question type category'
                }
            ])
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum);
            const total = await Post_1.Post.countDocuments({ type: 'lastword', isActive: true });
            let postsWithFlags = posts;
            if (currentUserId) {
                const user = await User_1.User.findById(currentUserId);
                postsWithFlags = posts.map((post) => ({
                    ...post.toJSON(),
                    isLiked: post.likes.includes(currentUserId),
                    isSaved: user?.savedPosts.includes(post._id) || false,
                    likesCount: post.likes.length,
                    commentsCount: post.comments.length,
                    sharesCount: post.shares.length
                }));
            }
            response_1.ResponseHandler.paginated(res, postsWithFlags, {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }, 'Last words retrieved successfully');
        });
    }
}
exports.postController = new PostController();
//# sourceMappingURL=postController.js.map
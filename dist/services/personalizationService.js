"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.personalizationService = void 0;
const User_1 = require("@/models/User");
const Post_1 = require("@/models/Post");
const logger_1 = require("@/utils/logger");
class PersonalizationService {
    async getPersonalizedFeed(userId, page = 1, limit = 20) {
        try {
            const user = await User_1.User.findById(userId)
                .populate('campus college department likes likedPosts');
            if (!user) {
                throw new Error('User not found');
            }
            let posts = [];
            let algorithm = 'default';
            if (user.likes.length === 0 && user.likedPosts.length === 0) {
                posts = await this.getNewUserFeed(user, page, limit);
                algorithm = 'new_user';
            }
            else {
                posts = await this.getPersonalizedContent(user, page, limit);
                algorithm = 'personalized';
            }
            const total = await this.getTotalPersonalizedCount(user);
            logger_1.logger.info(`Generated ${algorithm} feed for user ${userId}: ${posts.length} posts`);
            return { posts, total, algorithm };
        }
        catch (error) {
            logger_1.logger.error('Error generating personalized feed:', error);
            throw error;
        }
    }
    async getNewUserFeed(user, page, limit) {
        const posts = await Post_1.Post.find({
            isActive: true,
            user: { $ne: user._id }
        })
            .populate({
            path: 'user',
            match: {
                $or: [
                    { department: user.department },
                    { college: user.college },
                    { campus: user.campus }
                ]
            },
            select: 'firstName lastName surname username photo department college campus'
        })
            .populate('question', 'question type category')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        return posts.filter(post => post.user);
    }
    async getPersonalizedContent(user, page, limit) {
        const interactedUserIds = [
            ...user.likes,
            ...user.likedPosts.map((post) => post.user)
        ];
        const similarUsers = await User_1.User.find({
            _id: { $ne: user._id },
            $or: [
                { likes: { $in: user.likes } },
                { likedPosts: { $in: user.likedPosts } },
                { department: user.department },
                { college: user.college }
            ]
        }).select('_id likes likedPosts');
        const recommendedUserIds = similarUsers.map(u => u._id);
        const recommendedPostIds = similarUsers.flatMap(u => u.likedPosts);
        const posts = await Post_1.Post.find({
            isActive: true,
            $or: [
                { user: { $in: recommendedUserIds } },
                { _id: { $in: recommendedPostIds } },
                { user: { $in: interactedUserIds } }
            ],
            user: { $ne: user._id },
            _id: { $nin: user.likedPosts }
        })
            .populate('user', 'firstName lastName surname username photo department college campus')
            .populate('question', 'question type category')
            .sort({
            createdAt: -1,
            likes: -1,
            views: -1
        })
            .skip((page - 1) * limit)
            .limit(limit);
        return posts;
    }
    async getSuggestedUsers(userId, limit = 10) {
        try {
            const user = await User_1.User.findById(userId)
                .populate('likes department college campus');
            if (!user) {
                throw new Error('User not found');
            }
            const likedUsers = await User_1.User.find({ _id: { $in: user.likes } })
                .select('likes')
                .limit(20);
            const secondDegreeLikes = likedUsers.flatMap(u => u.likes);
            const academicSimilarUsers = await User_1.User.find({
                _id: {
                    $ne: userId,
                    $nin: user.likes
                },
                $or: [
                    { department: user.department },
                    { college: user.college },
                    { campus: user.campus }
                ],
                isActive: true,
                role: 'graduate'
            }).select('firstName lastName surname username photo graduationYear department college campus numberOfLikes');
            const suggestedUsers = await User_1.User.find({
                _id: {
                    $in: [...secondDegreeLikes, ...academicSimilarUsers.map(u => u._id)],
                    $ne: userId,
                    $nin: user.likes
                },
                isActive: true
            })
                .populate('department college campus', 'name')
                .select('firstName lastName surname username photo graduationYear numberOfLikes')
                .sort({ numberOfLikes: -1 })
                .limit(limit);
            logger_1.logger.info(`Generated ${suggestedUsers.length} suggested users for ${userId}`);
            return suggestedUsers;
        }
        catch (error) {
            logger_1.logger.error('Error getting suggested users:', error);
            throw error;
        }
    }
    async updateUserInteraction(userId, interactionType, targetId, targetType) {
        try {
            logger_1.logger.info(`User ${userId} ${interactionType}d ${targetType} ${targetId}`);
            if (targetType === 'user' && interactionType === 'view') {
                await User_1.User.findByIdAndUpdate(targetId, { $inc: { views: 1 } });
            }
        }
        catch (error) {
            logger_1.logger.error('Error updating user interaction:', error);
        }
    }
    async getTotalPersonalizedCount(user) {
        return Post_1.Post.countDocuments({
            isActive: true,
            user: { $ne: user._id }
        });
    }
    async getPopularContent(timeframe = 'week', limit = 20) {
        const timeMap = {
            day: 1,
            week: 7,
            month: 30
        };
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeMap[timeframe]);
        const posts = await Post_1.Post.find({
            isActive: true,
            createdAt: { $gte: startDate }
        })
            .populate('user', 'firstName lastName surname username photo')
            .populate('question', 'question type category')
            .sort({
            likes: -1,
            views: -1,
            comments: -1
        })
            .limit(limit);
        return posts;
    }
}
exports.personalizationService = new PersonalizationService();
//# sourceMappingURL=personalizationService.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const User_1 = require("@/models/User");
const Comment_1 = require("@/models/Comment");
const Tag_1 = require("@/models/Tag");
const Report_1 = require("@/models/Report");
const response_1 = require("@/utils/response");
const errors_1 = require("@/utils/errors");
const logger_1 = require("@/utils/logger");
const errorHandler_1 = require("@/middleware/errorHandler");
const notificationService_1 = require("@/services/notificationService");
const personalizationService_1 = require("@/services/personalizationService");
class UserController {
    constructor() {
        this.getProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const currentUserId = req.userId;
            const user = await User_1.User.findById(id)
                .populate('campus college department', 'name')
                .populate('likes', 'firstName lastName surname username photo')
                .populate('savedProfiles', 'firstName lastName surname username photo')
                .populate('tags', 'name category');
            if (!user || !user.isActive) {
                throw new errors_1.NotFoundError('User not found');
            }
            const canView = await this.checkProfileVisibility(user, currentUserId);
            if (!canView) {
                throw new errors_1.AuthorizationError('Profile is private');
            }
            if (currentUserId && currentUserId !== id) {
                user.views += 1;
                await user.save({ validateBeforeSave: false });
                await personalizationService_1.personalizationService.updateUserInteraction(currentUserId, 'view', id, 'user');
            }
            const currentUser = currentUserId ? await User_1.User.findById(currentUserId) : null;
            const isLiked = currentUser ? currentUser.likes.includes(user._id) : false;
            const isSaved = currentUser ? currentUser.savedProfiles.includes(user._id) : false;
            const mutualConnections = currentUser ?
                await this.getMutualConnectionsCount(currentUser, user) : 0;
            const canComment = await this.checkCommentPermission(user, currentUserId);
            const canViewContact = await this.checkContactVisibility(user, currentUserId);
            const profileResponse = {
                ...user.toJSON(),
                isLiked,
                isSaved,
                canComment,
                canViewContact,
                mutualConnections,
                phoneNumber: canViewContact ? user.phoneNumber : undefined,
                socialLinks: canViewContact ? user.socialLinks : undefined
            };
            response_1.ResponseHandler.success(res, profileResponse, 'Profile retrieved successfully');
        });
        this.likeProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const currentUserId = req.userId;
            if (id === currentUserId) {
                throw new errors_1.ValidationError('Cannot like your own profile');
            }
            const [currentUser, targetUser] = await Promise.all([
                User_1.User.findById(currentUserId),
                User_1.User.findById(id)
            ]);
            if (!targetUser || !targetUser.isActive) {
                throw new errors_1.NotFoundError('User not found');
            }
            const isAlreadyLiked = currentUser.likes.includes(targetUser._id);
            if (isAlreadyLiked) {
                currentUser.likes = currentUser.likes.filter(likeId => likeId.toString() !== id);
                targetUser.numberOfLikes = Math.max(0, targetUser.numberOfLikes - 1);
            }
            else {
                currentUser.likes.push(targetUser._id);
                targetUser.numberOfLikes += 1;
                await notificationService_1.notificationService.notifyProfileLike(id, currentUserId);
            }
            await Promise.all([
                currentUser.save(),
                targetUser.save()
            ]);
            response_1.ResponseHandler.success(res, {
                isLiked: !isAlreadyLiked,
                likesCount: targetUser.numberOfLikes
            }, isAlreadyLiked ? 'Profile unliked' : 'Profile liked');
        });
        this.saveProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const currentUserId = req.userId;
            if (id === currentUserId) {
                throw new errors_1.ValidationError('Cannot save your own profile');
            }
            const [currentUser, targetUser] = await Promise.all([
                User_1.User.findById(currentUserId),
                User_1.User.findById(id)
            ]);
            if (!targetUser || !targetUser.isActive) {
                throw new errors_1.NotFoundError('User not found');
            }
            const isAlreadySaved = currentUser.savedProfiles.includes(targetUser._id);
            if (isAlreadySaved) {
                currentUser.savedProfiles = currentUser.savedProfiles.filter(saveId => saveId.toString() !== id);
            }
            else {
                currentUser.savedProfiles.push(targetUser._id);
            }
            await currentUser.save();
            response_1.ResponseHandler.success(res, {
                isSaved: !isAlreadySaved
            }, isAlreadySaved ? 'Profile unsaved' : 'Profile saved');
        });
        this.commentOnProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { text } = req.body;
            const currentUserId = req.userId;
            if (id === currentUserId) {
                throw new errors_1.ValidationError('Cannot comment on your own profile');
            }
            const targetUser = await User_1.User.findById(id);
            if (!targetUser || !targetUser.isActive) {
                throw new errors_1.NotFoundError('User not found');
            }
            const canComment = await this.checkCommentPermission(targetUser, currentUserId);
            if (!canComment) {
                throw new errors_1.AuthorizationError('You cannot comment on this profile');
            }
            const comment = await Comment_1.Comment.create({
                user: currentUserId,
                profile: id,
                text
            });
            targetUser.comments.push(comment._id);
            targetUser.numberOfComments += 1;
            await targetUser.save();
            await notificationService_1.notificationService.notifyProfileComment(id, currentUserId);
            await comment.populate('user', 'firstName lastName surname username photo');
            response_1.ResponseHandler.created(res, comment, 'Comment added successfully');
        });
        this.getProfileComments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const comments = await Comment_1.Comment.find({ profile: id, isActive: true })
                .populate('user', 'firstName lastName surname username photo')
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum);
            const total = await Comment_1.Comment.countDocuments({ profile: id, isActive: true });
            response_1.ResponseHandler.paginated(res, comments, {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }, 'Comments retrieved successfully');
        });
        this.tagUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { tagIds } = req.body;
            const currentUserId = req.userId;
            if (id === currentUserId) {
                throw new errors_1.ValidationError('Cannot tag yourself');
            }
            const [targetUser, tags] = await Promise.all([
                User_1.User.findById(id),
                Tag_1.Tag.find({ _id: { $in: tagIds }, isActive: true })
            ]);
            if (!targetUser || !targetUser.isActive) {
                throw new errors_1.NotFoundError('User not found');
            }
            if (tags.length !== tagIds.length) {
                throw new errors_1.ValidationError('Some tags are invalid');
            }
            const newTags = tagIds.filter((tagId) => !targetUser.tags.includes(tagId));
            targetUser.tags.push(...newTags);
            await targetUser.save();
            await Tag_1.Tag.updateMany({ _id: { $in: newTags } }, { $inc: { usageCount: 1 } });
            if (newTags.length > 0) {
                await notificationService_1.notificationService.notifyUserTag(id, currentUserId);
            }
            response_1.ResponseHandler.success(res, { tagsAdded: newTags.length }, 'User tagged successfully');
        });
        this.reportUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { type, reason, description } = req.body;
            const currentUserId = req.userId;
            if (id === currentUserId) {
                throw new errors_1.ValidationError('Cannot report yourself');
            }
            const targetUser = await User_1.User.findById(id);
            if (!targetUser || !targetUser.isActive) {
                throw new errors_1.NotFoundError('User not found');
            }
            const existingReport = await Report_1.Report.findOne({
                reporter: currentUserId,
                reported: id,
                status: { $in: ['pending', 'reviewed'] }
            });
            if (existingReport) {
                throw new errors_1.ValidationError('You have already reported this user');
            }
            const report = await Report_1.Report.create({
                reporter: currentUserId,
                reported: id,
                type,
                reason,
                description
            });
            logger_1.logger.info(`User ${currentUserId} reported user ${id} for ${type}`);
            response_1.ResponseHandler.created(res, { reportId: report._id }, 'Report submitted successfully');
        });
        this.getLikedProfiles = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const currentUserId = req.userId;
            const { page = 1, limit = 20 } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const user = await User_1.User.findById(currentUserId)
                .populate({
                path: 'likes',
                select: 'firstName lastName surname username photo graduationYear campus college department',
                populate: {
                    path: 'campus college department',
                    select: 'name'
                },
                options: {
                    skip: (pageNum - 1) * limitNum,
                    limit: limitNum
                }
            });
            if (!user) {
                throw new errors_1.NotFoundError('User not found');
            }
            const total = user.likes.length;
            response_1.ResponseHandler.paginated(res, user.likes, {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }, 'Liked profiles retrieved successfully');
        });
        this.getSavedProfiles = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const currentUserId = req.userId;
            const { page = 1, limit = 20 } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const user = await User_1.User.findById(currentUserId)
                .populate({
                path: 'savedProfiles',
                select: 'firstName lastName surname username photo graduationYear campus college department',
                populate: {
                    path: 'campus college department',
                    select: 'name'
                },
                options: {
                    skip: (pageNum - 1) * limitNum,
                    limit: limitNum
                }
            });
            if (!user) {
                throw new errors_1.NotFoundError('User not found');
            }
            const total = user.savedProfiles.length;
            response_1.ResponseHandler.paginated(res, user.savedProfiles, {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }, 'Saved profiles retrieved successfully');
        });
        this.updatePrivacySettings = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const currentUserId = req.userId;
            const { privacySettings } = req.body;
            const user = await User_1.User.findByIdAndUpdate(currentUserId, { privacySettings }, { new: true, runValidators: true });
            if (!user) {
                throw new errors_1.NotFoundError('User not found');
            }
            response_1.ResponseHandler.success(res, user.privacySettings, 'Privacy settings updated successfully');
        });
        this.getSuggestedUsers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const currentUserId = req.userId;
            const { limit = 10 } = req.query;
            const suggestedUsers = await personalizationService_1.personalizationService.getSuggestedUsers(currentUserId, parseInt(limit));
            response_1.ResponseHandler.success(res, suggestedUsers, 'Suggested users retrieved successfully');
        });
    }
    async checkProfileVisibility(user, currentUserId) {
        if (!currentUserId) {
            return user.privacySettings.profileVisibility === 'public';
        }
        if (user._id.toString() === currentUserId) {
            return true;
        }
        const { profileVisibility, excludedUsers } = user.privacySettings;
        if (excludedUsers.includes(currentUserId)) {
            return false;
        }
        switch (profileVisibility) {
            case 'public':
                return true;
            case 'private':
                return false;
            case 'department':
            case 'college':
            case 'campus':
                const currentUser = await User_1.User.findById(currentUserId);
                if (!currentUser)
                    return false;
                if (profileVisibility === 'campus') {
                    return user.campus.toString() === currentUser.campus.toString();
                }
                if (profileVisibility === 'college') {
                    return user.college.toString() === currentUser.college.toString();
                }
                if (profileVisibility === 'department') {
                    return user.department.toString() === currentUser.department.toString();
                }
                return false;
            default:
                return false;
        }
    }
    async checkCommentPermission(user, currentUserId) {
        if (!currentUserId)
            return false;
        if (user._id.toString() === currentUserId) {
            return false;
        }
        const { commentPermission, excludedUsers } = user.privacySettings;
        if (excludedUsers.includes(currentUserId)) {
            return false;
        }
        switch (commentPermission) {
            case 'public':
                return true;
            case 'private':
                return false;
            case 'department':
            case 'college':
            case 'campus':
                const currentUser = await User_1.User.findById(currentUserId);
                if (!currentUser)
                    return false;
                if (commentPermission === 'campus') {
                    return user.campus.toString() === currentUser.campus.toString();
                }
                if (commentPermission === 'college') {
                    return user.college.toString() === currentUser.college.toString();
                }
                if (commentPermission === 'department') {
                    return user.department.toString() === currentUser.department.toString();
                }
                return false;
            default:
                return false;
        }
    }
    async checkContactVisibility(user, currentUserId) {
        if (!currentUserId)
            return false;
        if (user._id.toString() === currentUserId) {
            return true;
        }
        const { contactVisibility, excludedUsers } = user.privacySettings;
        if (excludedUsers.includes(currentUserId)) {
            return false;
        }
        switch (contactVisibility) {
            case 'public':
                return true;
            case 'private':
                return false;
            case 'department':
            case 'college':
            case 'campus':
                const currentUser = await User_1.User.findById(currentUserId);
                if (!currentUser)
                    return false;
                if (contactVisibility === 'campus') {
                    return user.campus.toString() === currentUser.campus.toString();
                }
                if (contactVisibility === 'college') {
                    return user.college.toString() === currentUser.college.toString();
                }
                if (contactVisibility === 'department') {
                    return user.department.toString() === currentUser.department.toString();
                }
                return false;
            default:
                return false;
        }
    }
    async getMutualConnectionsCount(user1, user2) {
        const mutualLikes = user1.likes.filter((like) => user2.likes.includes(like));
        return mutualLikes.length;
    }
}
exports.userController = new UserController();
//# sourceMappingURL=userController.js.map
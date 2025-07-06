"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagService = void 0;
const Tag_1 = require("@/models/Tag");
const User_1 = require("@/models/User");
const logger_1 = require("@/utils/logger");
class TagService {
    async getAllTags() {
        try {
            const tags = await Tag_1.Tag.find({ isActive: true })
                .sort({ usageCount: -1, name: 1 });
            return tags;
        }
        catch (error) {
            logger_1.logger.error('Error fetching all tags:', error);
            throw error;
        }
    }
    async getTagsByCategory(category) {
        try {
            const tags = await Tag_1.Tag.find({
                category,
                isActive: true
            }).sort({ usageCount: -1, name: 1 });
            return tags;
        }
        catch (error) {
            logger_1.logger.error('Error fetching tags by category:', error);
            throw error;
        }
    }
    async getPopularTags(limit = 20) {
        try {
            const tags = await Tag_1.Tag.find({ isActive: true })
                .sort({ usageCount: -1 })
                .limit(limit);
            return tags;
        }
        catch (error) {
            logger_1.logger.error('Error fetching popular tags:', error);
            throw error;
        }
    }
    async searchTags(query) {
        try {
            const searchRegex = new RegExp(query, 'i');
            const tags = await Tag_1.Tag.find({
                isActive: true,
                $or: [
                    { name: searchRegex },
                    { description: searchRegex }
                ]
            }).sort({ usageCount: -1 });
            return tags;
        }
        catch (error) {
            logger_1.logger.error('Error searching tags:', error);
            throw error;
        }
    }
    async createTag(tagData) {
        try {
            const existingTag = await Tag_1.Tag.findOne({
                name: tagData.name.toLowerCase()
            });
            if (existingTag) {
                throw new Error('Tag already exists');
            }
            const tag = await Tag_1.Tag.create({
                ...tagData,
                name: tagData.name.toLowerCase()
            });
            logger_1.logger.info(`Tag created: ${tag._id}`);
            return tag;
        }
        catch (error) {
            logger_1.logger.error('Error creating tag:', error);
            throw error;
        }
    }
    async updateTag(tagId, updates) {
        try {
            const tag = await Tag_1.Tag.findByIdAndUpdate(tagId, updates, { new: true, runValidators: true });
            if (tag) {
                logger_1.logger.info(`Tag updated: ${tagId}`);
            }
            return tag;
        }
        catch (error) {
            logger_1.logger.error('Error updating tag:', error);
            throw error;
        }
    }
    async deleteTag(tagId) {
        try {
            const result = await Tag_1.Tag.findByIdAndUpdate(tagId, { isActive: false }, { new: true });
            if (result) {
                logger_1.logger.info(`Tag deleted: ${tagId}`);
                return true;
            }
            return false;
        }
        catch (error) {
            logger_1.logger.error('Error deleting tag:', error);
            throw error;
        }
    }
    async incrementTagUsage(tagIds) {
        try {
            await Tag_1.Tag.updateMany({ _id: { $in: tagIds } }, { $inc: { usageCount: 1 } });
            logger_1.logger.info(`Tag usage incremented for ${tagIds.length} tags`);
        }
        catch (error) {
            logger_1.logger.error('Error incrementing tag usage:', error);
            throw error;
        }
    }
    async getTagCategories() {
        try {
            const categories = await Tag_1.Tag.distinct('category', { isActive: true });
            return categories;
        }
        catch (error) {
            logger_1.logger.error('Error fetching tag categories:', error);
            throw error;
        }
    }
    async getUserTags(userId) {
        try {
            const user = await User_1.User.findById(userId).populate('tags');
            return user?.tags || [];
        }
        catch (error) {
            logger_1.logger.error('Error fetching user tags:', error);
            throw error;
        }
    }
    async getTagStats() {
        try {
            const [totalTags, categories, mostUsedTag, usageStats] = await Promise.all([
                Tag_1.Tag.countDocuments({ isActive: true }),
                Tag_1.Tag.distinct('category', { isActive: true }),
                Tag_1.Tag.findOne({ isActive: true }).sort({ usageCount: -1 }),
                Tag_1.Tag.aggregate([
                    { $match: { isActive: true } },
                    { $group: { _id: null, avgUsage: { $avg: '$usageCount' } } }
                ])
            ]);
            return {
                totalTags,
                totalCategories: categories.length,
                mostUsedTag,
                averageUsage: usageStats[0]?.avgUsage || 0
            };
        }
        catch (error) {
            logger_1.logger.error('Error fetching tag stats:', error);
            throw error;
        }
    }
}
exports.tagService = new TagService();
//# sourceMappingURL=tagService.js.map
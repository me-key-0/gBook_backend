"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const User_1 = require("@/models/User");
const Post_1 = require("@/models/Post");
const Report_1 = require("@/models/Report");
const Question_1 = require("@/models/Question");
const Tag_1 = require("@/models/Tag");
const Campus_1 = require("@/models/Campus");
const College_1 = require("@/models/College");
const Department_1 = require("@/models/Department");
const response_1 = require("@/utils/response");
const errors_1 = require("@/utils/errors");
const logger_1 = require("@/utils/logger");
const errorHandler_1 = require("@/middleware/errorHandler");
class AdminController {
    constructor() {
        this.getAllUsers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 20, role, status, search } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const filter = {};
            if (role)
                filter.role = role;
            if (status === 'active')
                filter.isActive = true;
            if (status === 'inactive')
                filter.isActive = false;
            if (search) {
                const searchRegex = new RegExp(search, 'i');
                filter.$or = [
                    { firstName: searchRegex },
                    { lastName: searchRegex },
                    { username: searchRegex },
                    { email: searchRegex }
                ];
            }
            const [users, total] = await Promise.all([
                User_1.User.find(filter)
                    .populate('campus college department', 'name')
                    .select('-password')
                    .sort({ createdAt: -1 })
                    .skip((pageNum - 1) * limitNum)
                    .limit(limitNum),
                User_1.User.countDocuments(filter)
            ]);
            response_1.ResponseHandler.paginated(res, users, {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }, 'Users retrieved successfully');
        });
        this.deactivateUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { userId } = req.params;
            const { reason } = req.body;
            const user = await User_1.User.findById(userId);
            if (!user) {
                throw new errors_1.NotFoundError('User not found');
            }
            user.isActive = false;
            await user.save();
            logger_1.logger.info(`User ${userId} deactivated by admin ${req.userId}. Reason: ${reason}`);
            response_1.ResponseHandler.success(res, null, 'User deactivated successfully');
        });
        this.activateUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { userId } = req.params;
            const user = await User_1.User.findById(userId);
            if (!user) {
                throw new errors_1.NotFoundError('User not found');
            }
            user.isActive = true;
            await user.save();
            logger_1.logger.info(`User ${userId} activated by admin ${req.userId}`);
            response_1.ResponseHandler.success(res, null, 'User activated successfully');
        });
        this.getReports = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 20, status, type } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const filter = {};
            if (status)
                filter.status = status;
            if (type)
                filter.type = type;
            const [reports, total] = await Promise.all([
                Report_1.Report.find(filter)
                    .populate('reporter', 'firstName lastName username')
                    .populate('reported', 'firstName lastName username')
                    .populate('reviewedBy', 'firstName lastName username')
                    .sort({ createdAt: -1 })
                    .skip((pageNum - 1) * limitNum)
                    .limit(limitNum),
                Report_1.Report.countDocuments(filter)
            ]);
            response_1.ResponseHandler.paginated(res, reports, {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }, 'Reports retrieved successfully');
        });
        this.reviewReport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { reportId } = req.params;
            const { status, action } = req.body;
            const report = await Report_1.Report.findById(reportId);
            if (!report) {
                throw new errors_1.NotFoundError('Report not found');
            }
            report.status = status;
            report.reviewedBy = req.userId;
            report.reviewedAt = new Date();
            await report.save();
            if (action === 'deactivate_user') {
                await User_1.User.findByIdAndUpdate(report.reported, { isActive: false });
            }
            logger_1.logger.info(`Report ${reportId} reviewed by admin ${req.userId}. Status: ${status}, Action: ${action}`);
            response_1.ResponseHandler.success(res, report, 'Report reviewed successfully');
        });
        this.getQuestions = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { type, category, isActive } = req.query;
            const filter = {};
            if (type)
                filter.type = type;
            if (category)
                filter.category = category;
            if (isActive !== undefined)
                filter.isActive = isActive === 'true';
            const questions = await Question_1.Question.find(filter)
                .sort({ order: 1, createdAt: -1 });
            response_1.ResponseHandler.success(res, questions, 'Questions retrieved successfully');
        });
        this.createQuestion = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { question, type, category, isRequired, options, order } = req.body;
            const newQuestion = await Question_1.Question.create({
                question,
                type,
                category,
                isRequired,
                options,
                order
            });
            logger_1.logger.info(`Question created by admin ${req.userId}: ${newQuestion._id}`);
            response_1.ResponseHandler.created(res, newQuestion, 'Question created successfully');
        });
        this.updateQuestion = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { questionId } = req.params;
            const updates = req.body;
            const question = await Question_1.Question.findByIdAndUpdate(questionId, updates, { new: true, runValidators: true });
            if (!question) {
                throw new errors_1.NotFoundError('Question not found');
            }
            logger_1.logger.info(`Question ${questionId} updated by admin ${req.userId}`);
            response_1.ResponseHandler.success(res, question, 'Question updated successfully');
        });
        this.deleteQuestion = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { questionId } = req.params;
            const question = await Question_1.Question.findByIdAndUpdate(questionId, { isActive: false }, { new: true });
            if (!question) {
                throw new errors_1.NotFoundError('Question not found');
            }
            logger_1.logger.info(`Question ${questionId} deleted by admin ${req.userId}`);
            response_1.ResponseHandler.success(res, null, 'Question deleted successfully');
        });
        this.getTags = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { category, isActive } = req.query;
            const filter = {};
            if (category)
                filter.category = category;
            if (isActive !== undefined)
                filter.isActive = isActive === 'true';
            const tags = await Tag_1.Tag.find(filter)
                .sort({ usageCount: -1, name: 1 });
            response_1.ResponseHandler.success(res, tags, 'Tags retrieved successfully');
        });
        this.createTag = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { name, description, category } = req.body;
            const existingTag = await Tag_1.Tag.findOne({ name: name.toLowerCase() });
            if (existingTag) {
                throw new errors_1.ValidationError('Tag already exists');
            }
            const tag = await Tag_1.Tag.create({
                name: name.toLowerCase(),
                description,
                category
            });
            logger_1.logger.info(`Tag created by admin ${req.userId}: ${tag._id}`);
            response_1.ResponseHandler.created(res, tag, 'Tag created successfully');
        });
        this.updateTag = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { tagId } = req.params;
            const updates = req.body;
            const tag = await Tag_1.Tag.findByIdAndUpdate(tagId, updates, { new: true, runValidators: true });
            if (!tag) {
                throw new errors_1.NotFoundError('Tag not found');
            }
            logger_1.logger.info(`Tag ${tagId} updated by admin ${req.userId}`);
            response_1.ResponseHandler.success(res, tag, 'Tag updated successfully');
        });
        this.deleteTag = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { tagId } = req.params;
            const tag = await Tag_1.Tag.findByIdAndUpdate(tagId, { isActive: false }, { new: true });
            if (!tag) {
                throw new errors_1.NotFoundError('Tag not found');
            }
            logger_1.logger.info(`Tag ${tagId} deleted by admin ${req.userId}`);
            response_1.ResponseHandler.success(res, null, 'Tag deleted successfully');
        });
        this.createCampus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { name, campusId, location, description } = req.body;
            const campus = await Campus_1.Campus.create({
                name,
                campusId,
                location,
                description
            });
            logger_1.logger.info(`Campus created by admin ${req.userId}: ${campus._id}`);
            response_1.ResponseHandler.created(res, campus, 'Campus created successfully');
        });
        this.createCollege = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { name, collegeId, campus, description } = req.body;
            const college = await College_1.College.create({
                name,
                collegeId,
                campus,
                description
            });
            logger_1.logger.info(`College created by admin ${req.userId}: ${college._id}`);
            response_1.ResponseHandler.created(res, college, 'College created successfully');
        });
        this.createDepartment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { name, departmentId, college, description } = req.body;
            const department = await Department_1.Department.create({
                name,
                departmentId,
                college,
                description
            });
            logger_1.logger.info(`Department created by admin ${req.userId}: ${department._id}`);
            response_1.ResponseHandler.created(res, department, 'Department created successfully');
        });
        this.getAnalytics = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const [totalUsers, totalGraduates, totalGuests, totalPosts, totalReports, activeUsers, newUsersToday] = await Promise.all([
                User_1.User.countDocuments({ isActive: true }),
                User_1.User.countDocuments({ isActive: true, role: 'graduate' }),
                User_1.User.countDocuments({ isActive: true, role: 'guest' }),
                Post_1.Post.countDocuments({ isActive: true }),
                Report_1.Report.countDocuments({ status: 'pending' }),
                User_1.User.countDocuments({
                    isActive: true,
                    lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                }),
                User_1.User.countDocuments({
                    isActive: true,
                    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                })
            ]);
            const topCampuses = await User_1.User.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: '$campus', userCount: { $sum: 1 } } },
                { $lookup: { from: 'campuses', localField: '_id', foreignField: '_id', as: 'campus' } },
                { $unwind: '$campus' },
                { $project: { name: '$campus.name', userCount: 1 } },
                { $sort: { userCount: -1 } },
                { $limit: 5 }
            ]);
            const analytics = {
                totalUsers,
                totalGraduates,
                totalGuests,
                totalPosts,
                totalReports,
                activeUsers,
                newUsersToday,
                topCampuses
            };
            response_1.ResponseHandler.success(res, analytics, 'Analytics retrieved successfully');
        });
    }
}
exports.adminController = new AdminController();
//# sourceMappingURL=adminController.js.map
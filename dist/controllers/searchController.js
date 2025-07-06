"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchController = void 0;
const User_1 = require("@/models/User");
const Campus_1 = require("@/models/Campus");
const College_1 = require("@/models/College");
const Department_1 = require("@/models/Department");
const Post_1 = require("@/models/Post");
const response_1 = require("@/utils/response");
const logger_1 = require("@/utils/logger");
const errorHandler_1 = require("@/middleware/errorHandler");
const personalizationService_1 = require("@/services/personalizationService");
class SearchController {
    constructor() {
        this.searchUsers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { q, campus, college, department, graduationYear, role, page = 1, limit = 20, sort = 'recent', order = 'desc' } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const filter = { isActive: true };
            if (q) {
                const searchRegex = new RegExp(q, 'i');
                filter.$or = [
                    { firstName: searchRegex },
                    { lastName: searchRegex },
                    { surname: searchRegex },
                    { username: searchRegex }
                ];
            }
            if (campus)
                filter.campus = campus;
            if (college)
                filter.college = college;
            if (department)
                filter.department = department;
            if (graduationYear)
                filter.graduationYear = parseInt(graduationYear);
            if (role)
                filter.role = role;
            let sortOptions = {};
            switch (sort) {
                case 'name':
                    sortOptions = { firstName: order === 'desc' ? -1 : 1 };
                    break;
                case 'likes':
                    sortOptions = { numberOfLikes: order === 'desc' ? -1 : 1 };
                    break;
                case 'views':
                    sortOptions = { views: order === 'desc' ? -1 : 1 };
                    break;
                case 'recent':
                default:
                    sortOptions = { createdAt: order === 'desc' ? -1 : 1 };
                    break;
            }
            const [users, total] = await Promise.all([
                User_1.User.find(filter)
                    .populate('campus college department', 'name')
                    .select('firstName lastName surname username photo graduationYear numberOfLikes views campus college department role')
                    .sort(sortOptions)
                    .skip((pageNum - 1) * limitNum)
                    .limit(limitNum),
                User_1.User.countDocuments(filter)
            ]);
            if (campus) {
                await Campus_1.Campus.findByIdAndUpdate(campus, { $inc: { searchPoints: 1 } });
            }
            if (college) {
                await College_1.College.findByIdAndUpdate(college, { $inc: { searchPoints: 1 } });
            }
            if (department) {
                await Department_1.Department.findByIdAndUpdate(department, { $inc: { searchPoints: 1 } });
            }
            logger_1.logger.info(`Search performed: query="${q}", filters=${JSON.stringify({ campus, college, department, graduationYear, role })}, results=${users.length}`);
            response_1.ResponseHandler.paginated(res, users, {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }, 'Search results retrieved successfully');
        });
        this.searchPosts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { q, type, campus, college, department, page = 1, limit = 20, sort = 'recent' } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const filter = { isActive: true };
            if (type)
                filter.type = type;
            const userFilter = { isActive: true };
            if (campus)
                userFilter.campus = campus;
            if (college)
                userFilter.college = college;
            if (department)
                userFilter.department = department;
            let userIds = [];
            if (campus || college || department) {
                const users = await User_1.User.find(userFilter).select('_id');
                userIds = users.map(user => user._id.toString());
                filter.user = { $in: userIds };
            }
            if (q) {
                filter.answer = new RegExp(q, 'i');
            }
            let sortOptions = {};
            switch (sort) {
                case 'likes':
                    sortOptions = { likes: -1 };
                    break;
                case 'views':
                    sortOptions = { views: -1 };
                    break;
                case 'comments':
                    sortOptions = { comments: -1 };
                    break;
                case 'recent':
                default:
                    sortOptions = { createdAt: -1 };
                    break;
            }
            const [posts, total] = await Promise.all([
                Post_1.Post.find(filter)
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
                    .sort(sortOptions)
                    .skip((pageNum - 1) * limitNum)
                    .limit(limitNum),
                Post_1.Post.countDocuments(filter)
            ]);
            response_1.ResponseHandler.paginated(res, posts, {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }, 'Post search results retrieved successfully');
        });
        this.getSuggestedUsers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const currentUserId = req.userId;
            const { limit = 10 } = req.query;
            const suggestedUsers = await personalizationService_1.personalizationService.getSuggestedUsers(currentUserId, parseInt(limit));
            response_1.ResponseHandler.success(res, suggestedUsers, 'Suggested users retrieved successfully');
        });
        this.getSearchFilters = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const campuses = await Campus_1.Campus.find({ isActive: true })
                .sort({ searchPoints: -1, name: 1 })
                .select('name campusId');
            const colleges = await College_1.College.find({ isActive: true })
                .populate('campus', 'name')
                .sort({ searchPoints: -1, name: 1 })
                .select('name collegeId campus');
            const departments = await Department_1.Department.find({ isActive: true })
                .populate('college', 'name')
                .sort({ searchPoints: -1, name: 1 })
                .select('name departmentId college');
            const graduationYears = await User_1.User.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: null, min: { $min: '$graduationYear' }, max: { $max: '$graduationYear' } } }
            ]);
            const yearRange = graduationYears[0] || { min: new Date().getFullYear() - 10, max: new Date().getFullYear() + 5 };
            const filters = {
                campuses,
                colleges,
                departments,
                graduationYears: {
                    min: yearRange.min,
                    max: yearRange.max
                },
                roles: ['graduate', 'guest'],
                sortOptions: [
                    { value: 'recent', label: 'Most Recent' },
                    { value: 'name', label: 'Name (A-Z)' },
                    { value: 'likes', label: 'Most Liked' },
                    { value: 'views', label: 'Most Viewed' }
                ]
            };
            response_1.ResponseHandler.success(res, filters, 'Search filters retrieved successfully');
        });
        this.getPopularSearches = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { limit = 10 } = req.query;
            const [popularCampuses, popularColleges, popularDepartments] = await Promise.all([
                Campus_1.Campus.find({ isActive: true })
                    .sort({ searchPoints: -1 })
                    .limit(parseInt(limit))
                    .select('name searchPoints'),
                College_1.College.find({ isActive: true })
                    .populate('campus', 'name')
                    .sort({ searchPoints: -1 })
                    .limit(parseInt(limit))
                    .select('name searchPoints campus'),
                Department_1.Department.find({ isActive: true })
                    .populate('college', 'name')
                    .sort({ searchPoints: -1 })
                    .limit(parseInt(limit))
                    .select('name searchPoints college')
            ]);
            const popularSearches = {
                campuses: popularCampuses,
                colleges: popularColleges,
                departments: popularDepartments
            };
            response_1.ResponseHandler.success(res, popularSearches, 'Popular searches retrieved successfully');
        });
        this.getQuickSearch = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { q, limit = 5 } = req.query;
            if (!q || q.length < 2) {
                return response_1.ResponseHandler.success(res, { users: [], posts: [] }, 'Quick search results');
            }
            const searchRegex = new RegExp(q, 'i');
            const users = await User_1.User.find({
                isActive: true,
                $or: [
                    { firstName: searchRegex },
                    { lastName: searchRegex },
                    { surname: searchRegex },
                    { username: searchRegex }
                ]
            })
                .select('firstName lastName surname username photo')
                .limit(parseInt(limit));
            const posts = await Post_1.Post.find({
                isActive: true,
                answer: searchRegex
            })
                .populate('user', 'firstName lastName surname username photo')
                .populate('question', 'question')
                .select('answer user question')
                .limit(parseInt(limit));
            response_1.ResponseHandler.success(res, { users, posts }, 'Quick search results retrieved successfully');
        });
        this.getRecentSearches = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const currentUserId = req.userId;
            const recentSearches = [];
            response_1.ResponseHandler.success(res, recentSearches, 'Recent searches retrieved successfully');
        });
        this.saveSearch = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const currentUserId = req.userId;
            const { query, filters } = req.body;
            logger_1.logger.info(`Search saved for user ${currentUserId}: query="${query}", filters=${JSON.stringify(filters)}`);
            response_1.ResponseHandler.success(res, null, 'Search saved successfully');
        });
    }
}
exports.searchController = new SearchController();
//# sourceMappingURL=searchController.js.map
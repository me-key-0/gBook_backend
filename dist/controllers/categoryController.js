"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = void 0;
const Campus_1 = require("@/models/Campus");
const College_1 = require("@/models/College");
const Department_1 = require("@/models/Department");
const User_1 = require("@/models/User");
const response_1 = require("@/utils/response");
const errors_1 = require("@/utils/errors");
const errorHandler_1 = require("@/middleware/errorHandler");
class CategoryController {
    constructor() {
        this.getAllCampuses = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const campuses = await Campus_1.Campus.find({ isActive: true })
                .sort({ searchPoints: -1, name: 1 })
                .select('name campusId location description');
            response_1.ResponseHandler.success(res, campuses, 'Campuses retrieved successfully');
        });
        this.getCampusColleges = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { campusId } = req.params;
            const campus = await Campus_1.Campus.findById(campusId);
            if (!campus || !campus.isActive) {
                throw new errors_1.NotFoundError('Campus not found');
            }
            const colleges = await College_1.College.find({ campus: campusId, isActive: true })
                .sort({ searchPoints: -1, name: 1 })
                .select('name collegeId description');
            response_1.ResponseHandler.success(res, {
                campus: {
                    name: campus.name,
                    campusId: campus.campusId
                },
                colleges
            }, 'Campus colleges retrieved successfully');
        });
        this.getCollegeDepartments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { collegeId } = req.params;
            const college = await College_1.College.findById(collegeId).populate('campus', 'name');
            if (!college || !college.isActive) {
                throw new errors_1.NotFoundError('College not found');
            }
            const departments = await Department_1.Department.find({ college: collegeId, isActive: true })
                .sort({ searchPoints: -1, name: 1 })
                .select('name departmentId description');
            response_1.ResponseHandler.success(res, {
                college: {
                    name: college.name,
                    collegeId: college.collegeId,
                    campus: college.campus
                },
                departments
            }, 'College departments retrieved successfully');
        });
        this.getDepartmentUsers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { departmentId } = req.params;
            const { page = 1, limit = 20, graduationYear, sort = 'name' } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const department = await Department_1.Department.findById(departmentId)
                .populate('college', 'name')
                .populate('college.campus', 'name');
            if (!department || !department.isActive) {
                throw new errors_1.NotFoundError('Department not found');
            }
            const filter = {
                department: departmentId,
                isActive: true,
                role: 'graduate'
            };
            if (graduationYear) {
                filter.graduationYear = parseInt(graduationYear);
            }
            let sortOptions = {};
            switch (sort) {
                case 'name':
                    sortOptions = { firstName: 1, lastName: 1 };
                    break;
                case 'year':
                    sortOptions = { graduationYear: -1 };
                    break;
                case 'likes':
                    sortOptions = { numberOfLikes: -1 };
                    break;
                case 'recent':
                default:
                    sortOptions = { createdAt: -1 };
                    break;
            }
            const [users, total] = await Promise.all([
                User_1.User.find(filter)
                    .populate('campus college department', 'name')
                    .select('firstName lastName surname username photo graduationYear numberOfLikes views')
                    .sort(sortOptions)
                    .skip((pageNum - 1) * limitNum)
                    .limit(limitNum),
                User_1.User.countDocuments(filter)
            ]);
            await Department_1.Department.findByIdAndUpdate(departmentId, { $inc: { searchPoints: 1 } });
            response_1.ResponseHandler.paginated(res, {
                department: {
                    name: department.name,
                    departmentId: department.departmentId,
                    college: department.college
                },
                users
            }, {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }, 'Department users retrieved successfully');
        });
        this.getCampusStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { campusId } = req.params;
            const campus = await Campus_1.Campus.findById(campusId);
            if (!campus || !campus.isActive) {
                throw new errors_1.NotFoundError('Campus not found');
            }
            const [totalUsers, totalGraduates, totalGuests, collegeCount] = await Promise.all([
                User_1.User.countDocuments({ campus: campusId, isActive: true }),
                User_1.User.countDocuments({ campus: campusId, isActive: true, role: 'graduate' }),
                User_1.User.countDocuments({ campus: campusId, isActive: true, role: 'guest' }),
                College_1.College.countDocuments({ campus: campusId, isActive: true })
            ]);
            const graduationYearStats = await User_1.User.aggregate([
                { $match: { campus: campus._id, isActive: true, role: 'graduate' } },
                { $group: { _id: '$graduationYear', count: { $sum: 1 } } },
                { $sort: { _id: -1 } },
                { $limit: 10 }
            ]);
            const stats = {
                campus: {
                    name: campus.name,
                    campusId: campus.campusId
                },
                totalUsers,
                totalGraduates,
                totalGuests,
                collegeCount,
                graduationYearStats
            };
            response_1.ResponseHandler.success(res, stats, 'Campus statistics retrieved successfully');
        });
        this.getCollegeStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { collegeId } = req.params;
            const college = await College_1.College.findById(collegeId).populate('campus', 'name');
            if (!college || !college.isActive) {
                throw new errors_1.NotFoundError('College not found');
            }
            const [totalUsers, totalGraduates, totalGuests, departmentCount] = await Promise.all([
                User_1.User.countDocuments({ college: collegeId, isActive: true }),
                User_1.User.countDocuments({ college: collegeId, isActive: true, role: 'graduate' }),
                User_1.User.countDocuments({ college: collegeId, isActive: true, role: 'guest' }),
                Department_1.Department.countDocuments({ college: collegeId, isActive: true })
            ]);
            const topDepartments = await User_1.User.aggregate([
                { $match: { college: college._id, isActive: true } },
                { $group: { _id: '$department', count: { $sum: 1 } } },
                { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'department' } },
                { $unwind: '$department' },
                { $project: { name: '$department.name', count: 1 } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]);
            const stats = {
                college: {
                    name: college.name,
                    collegeId: college.collegeId,
                    campus: college.campus
                },
                totalUsers,
                totalGraduates,
                totalGuests,
                departmentCount,
                topDepartments
            };
            response_1.ResponseHandler.success(res, stats, 'College statistics retrieved successfully');
        });
        this.getAcademicStructure = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const campuses = await Campus_1.Campus.find({ isActive: true })
                .sort({ name: 1 })
                .select('name campusId');
            const structure = await Promise.all(campuses.map(async (campus) => {
                const colleges = await College_1.College.find({ campus: campus._id, isActive: true })
                    .sort({ name: 1 })
                    .select('name collegeId');
                const collegesWithDepartments = await Promise.all(colleges.map(async (college) => {
                    const departments = await Department_1.Department.find({ college: college._id, isActive: true })
                        .sort({ name: 1 })
                        .select('name departmentId');
                    return {
                        ...college.toJSON(),
                        departments
                    };
                }));
                return {
                    ...campus.toJSON(),
                    colleges: collegesWithDepartments
                };
            }));
            response_1.ResponseHandler.success(res, structure, 'Academic structure retrieved successfully');
        });
    }
}
exports.categoryController = new CategoryController();
//# sourceMappingURL=categoryController.js.map
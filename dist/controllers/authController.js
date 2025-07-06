"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("@/models/User");
const Campus_1 = require("@/models/Campus");
const College_1 = require("@/models/College");
const Department_1 = require("@/models/Department");
const response_1 = require("@/utils/response");
const errors_1 = require("@/utils/errors");
const logger_1 = require("@/utils/logger");
const errorHandler_1 = require("@/middleware/errorHandler");
class AuthController {
    constructor() {
        this.register = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { firstName, lastName, surname, username, email, password, phoneNumber, graduationYear, campus, college, department, role } = req.body;
            const existingUser = await User_1.User.findOne({
                $or: [{ email }, { username }]
            });
            if (existingUser) {
                if (existingUser.email === email) {
                    throw new errors_1.ConflictError('Email already registered');
                }
                if (existingUser.username === username) {
                    throw new errors_1.ConflictError('Username already taken');
                }
            }
            const [campusDoc, collegeDoc, departmentDoc] = await Promise.all([
                Campus_1.Campus.findById(campus),
                College_1.College.findById(college),
                Department_1.Department.findById(department)
            ]);
            if (!campusDoc) {
                throw new errors_1.ValidationError('Invalid campus selected');
            }
            if (!collegeDoc) {
                throw new errors_1.ValidationError('Invalid college selected');
            }
            if (!departmentDoc) {
                throw new errors_1.ValidationError('Invalid department selected');
            }
            if (collegeDoc.campus.toString() !== campus) {
                throw new errors_1.ValidationError('College does not belong to selected campus');
            }
            if (departmentDoc.college.toString() !== college) {
                throw new errors_1.ValidationError('Department does not belong to selected college');
            }
            const user = await User_1.User.create({
                firstName,
                lastName,
                surname,
                username: username.toLowerCase(),
                email: email.toLowerCase(),
                password,
                phoneNumber,
                graduationYear,
                campus,
                college,
                department,
                role,
                isVerified: role === 'guest',
                profileCompleted: role === 'guest'
            });
            const token = user.generateAuthToken();
            const userResponse = user.toJSON();
            logger_1.logger.info(`New user registered: ${email} (${role})`);
            response_1.ResponseHandler.created(res, {
                user: userResponse,
                token,
                requiresProfileCompletion: role === 'graduate' && !user.profileCompleted
            }, 'Registration successful');
        });
        this.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { email, password } = req.body;
            const user = await User_1.User.findOne({ email: email.toLowerCase() })
                .select('+password')
                .populate('campus college department', 'name');
            if (!user) {
                throw new errors_1.AuthenticationError('Invalid email or password');
            }
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                throw new errors_1.AuthenticationError('Invalid email or password');
            }
            if (!user.isActive) {
                throw new errors_1.AuthenticationError('Account is deactivated');
            }
            const token = user.generateAuthToken();
            user.updateLastActive();
            const userResponse = user.toJSON();
            logger_1.logger.info(`User logged in: ${email}`);
            response_1.ResponseHandler.success(res, {
                user: userResponse,
                token,
                requiresProfileCompletion: user.role === 'graduate' && !user.profileCompleted
            }, 'Login successful');
        });
        this.getProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const user = await User_1.User.findById(req.userId)
                .populate('campus college department', 'name')
                .populate('likes', 'firstName lastName surname username photo')
                .populate('savedProfiles', 'firstName lastName surname username photo');
            if (!user) {
                throw new errors_1.AuthenticationError('User not found');
            }
            response_1.ResponseHandler.success(res, user, 'Profile retrieved successfully');
        });
        this.updateProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const allowedUpdates = [
                'firstName', 'lastName', 'surname', 'quote', 'phoneNumber',
                'socialLinks', 'privacySettings'
            ];
            const updates = Object.keys(req.body);
            const isValidOperation = updates.every(update => allowedUpdates.includes(update));
            if (!isValidOperation) {
                throw new errors_1.ValidationError('Invalid updates');
            }
            const user = await User_1.User.findByIdAndUpdate(req.userId, { ...req.body, profileCompleted: true }, { new: true, runValidators: true }).populate('campus college department', 'name');
            if (!user) {
                throw new errors_1.AuthenticationError('User not found');
            }
            logger_1.logger.info(`Profile updated for user: ${user.email}`);
            response_1.ResponseHandler.success(res, user, 'Profile updated successfully');
        });
        this.changePassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { currentPassword, newPassword } = req.body;
            const user = await User_1.User.findById(req.userId).select('+password');
            if (!user) {
                throw new errors_1.AuthenticationError('User not found');
            }
            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                throw new errors_1.AuthenticationError('Current password is incorrect');
            }
            user.password = newPassword;
            await user.save();
            logger_1.logger.info(`Password changed for user: ${user.email}`);
            response_1.ResponseHandler.success(res, null, 'Password changed successfully');
        });
        this.deleteAccount = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { password } = req.body;
            const user = await User_1.User.findById(req.userId).select('+password');
            if (!user) {
                throw new errors_1.AuthenticationError('User not found');
            }
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                throw new errors_1.AuthenticationError('Password is incorrect');
            }
            user.isActive = false;
            await user.save();
            logger_1.logger.info(`Account deactivated for user: ${user.email}`);
            response_1.ResponseHandler.success(res, null, 'Account deleted successfully');
        });
        this.refreshToken = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const user = await User_1.User.findById(req.userId);
            if (!user) {
                throw new errors_1.AuthenticationError('User not found');
            }
            const token = user.generateAuthToken();
            response_1.ResponseHandler.success(res, { token }, 'Token refreshed successfully');
        });
        this.verifyEmail = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { token } = req.params;
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                const user = await User_1.User.findById(decoded.id);
                if (!user) {
                    throw new errors_1.AuthenticationError('Invalid verification token');
                }
                if (user.isVerified) {
                    return response_1.ResponseHandler.success(res, null, 'Email already verified');
                }
                user.isVerified = true;
                await user.save();
                logger_1.logger.info(`Email verified for user: ${user.email}`);
                response_1.ResponseHandler.success(res, null, 'Email verified successfully');
            }
            catch (error) {
                throw new errors_1.AuthenticationError('Invalid or expired verification token');
            }
        });
        this.forgotPassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { email } = req.body;
            const user = await User_1.User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return response_1.ResponseHandler.success(res, null, 'If email exists, reset instructions have been sent');
            }
            const resetToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            logger_1.logger.info(`Password reset token for ${email}: ${resetToken}`);
            response_1.ResponseHandler.success(res, null, 'If email exists, reset instructions have been sent');
        });
        this.resetPassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { token, newPassword } = req.body;
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                const user = await User_1.User.findById(decoded.id);
                if (!user) {
                    throw new errors_1.AuthenticationError('Invalid reset token');
                }
                user.password = newPassword;
                await user.save();
                logger_1.logger.info(`Password reset for user: ${user.email}`);
                response_1.ResponseHandler.success(res, null, 'Password reset successfully');
            }
            catch (error) {
                throw new errors_1.AuthenticationError('Invalid or expired reset token');
            }
        });
    }
}
exports.authController = new AuthController();
//# sourceMappingURL=authController.js.map
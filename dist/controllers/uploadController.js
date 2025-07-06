"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = void 0;
const User_1 = require("@/models/User");
const response_1 = require("@/utils/response");
const errors_1 = require("@/utils/errors");
const logger_1 = require("@/utils/logger");
const errorHandler_1 = require("@/middleware/errorHandler");
const fileUploadService_1 = require("@/services/fileUploadService");
class UploadController {
    constructor() {
        this.uploadProfilePhoto = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const currentUserId = req.userId;
            const file = req.file;
            if (!file) {
                throw new errors_1.FileUploadError('No file provided');
            }
            const uploadResult = await fileUploadService_1.fileUploadService.uploadProfilePhoto(file, currentUserId);
            const user = await User_1.User.findByIdAndUpdate(currentUserId, { photo: uploadResult.url }, { new: true });
            if (!user) {
                throw new errors_1.NotFoundError('User not found');
            }
            logger_1.logger.info(`Profile photo uploaded for user ${currentUserId}: ${uploadResult.url}`);
            response_1.ResponseHandler.success(res, {
                url: uploadResult.url,
                user: {
                    photo: user.photo
                }
            }, 'Profile photo uploaded successfully');
        });
        this.uploadCoverImage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const currentUserId = req.userId;
            const file = req.file;
            if (!file) {
                throw new errors_1.FileUploadError('No file provided');
            }
            const uploadResult = await fileUploadService_1.fileUploadService.uploadCoverImage(file, currentUserId);
            const user = await User_1.User.findByIdAndUpdate(currentUserId, { coverImage: uploadResult.url }, { new: true });
            if (!user) {
                throw new errors_1.NotFoundError('User not found');
            }
            logger_1.logger.info(`Cover image uploaded for user ${currentUserId}: ${uploadResult.url}`);
            response_1.ResponseHandler.success(res, {
                url: uploadResult.url,
                user: {
                    coverImage: user.coverImage
                }
            }, 'Cover image uploaded successfully');
        });
        this.uploadPostImage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const currentUserId = req.userId;
            const file = req.file;
            if (!file) {
                throw new errors_1.FileUploadError('No file provided');
            }
            const uploadResult = await fileUploadService_1.fileUploadService.uploadPostImage(file, currentUserId);
            logger_1.logger.info(`Post image uploaded for user ${currentUserId}: ${uploadResult.url}`);
            response_1.ResponseHandler.success(res, {
                url: uploadResult.url,
                filename: uploadResult.filename,
                size: uploadResult.size
            }, 'Post image uploaded successfully');
        });
        this.deleteImage = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { filename } = req.params;
            const currentUserId = req.userId;
            if (!filename.includes(currentUserId)) {
                throw new errors_1.FileUploadError('Unauthorized to delete this file');
            }
            await fileUploadService_1.fileUploadService.deleteImage(filename);
            logger_1.logger.info(`Image deleted by user ${currentUserId}: ${filename}`);
            response_1.ResponseHandler.success(res, null, 'Image deleted successfully');
        });
    }
}
exports.uploadController = new UploadController();
//# sourceMappingURL=uploadController.js.map
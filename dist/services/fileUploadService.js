"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploadService = void 0;
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const firebase_1 = require("@/config/firebase");
const errors_1 = require("@/utils/errors");
const logger_1 = require("@/utils/logger");
class FileUploadService {
    constructor() {
        this.storage = multer_1.default.memoryStorage();
        this.fileFilter = (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            }
            else {
                cb(new errors_1.FileUploadError('Only image files are allowed'));
            }
        };
        this.upload = (0, multer_1.default)({
            storage: this.storage,
            fileFilter: this.fileFilter,
            limits: {
                fileSize: 5 * 1024 * 1024,
                files: 1
            }
        });
    }
    async uploadImage(file, folder = 'uploads', options = {}) {
        try {
            if (!file) {
                throw new errors_1.FileUploadError('No file provided');
            }
            const processedImage = await this.processImage(file.buffer, options);
            const filename = `${folder}/${(0, uuid_1.v4)()}.${options.format || 'jpeg'}`;
            const bucket = firebase_1.firebaseService.getStorage().bucket();
            const fileRef = bucket.file(filename);
            await fileRef.save(processedImage, {
                metadata: {
                    contentType: `image/${options.format || 'jpeg'}`,
                    metadata: {
                        originalName: file.originalname,
                        uploadedAt: new Date().toISOString()
                    }
                }
            });
            await fileRef.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
            logger_1.logger.info(`File uploaded successfully: ${filename}`);
            return {
                url: publicUrl,
                filename,
                size: processedImage.length,
                mimetype: `image/${options.format || 'jpeg'}`
            };
        }
        catch (error) {
            logger_1.logger.error('File upload error:', error);
            throw new errors_1.FileUploadError('Failed to upload file');
        }
    }
    async deleteImage(filename) {
        try {
            const bucket = firebase_1.firebaseService.getStorage().bucket();
            const fileRef = bucket.file(filename);
            await fileRef.delete();
            logger_1.logger.info(`File deleted successfully: ${filename}`);
        }
        catch (error) {
            logger_1.logger.error('File deletion error:', error);
            throw new errors_1.FileUploadError('Failed to delete file');
        }
    }
    async processImage(buffer, options = {}) {
        const { width = 800, height, quality = 80, format = 'jpeg' } = options;
        let sharpInstance = (0, sharp_1.default)(buffer);
        if (width || height) {
            sharpInstance = sharpInstance.resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }
        switch (format) {
            case 'jpeg':
                sharpInstance = sharpInstance.jpeg({ quality });
                break;
            case 'png':
                sharpInstance = sharpInstance.png({ quality });
                break;
            case 'webp':
                sharpInstance = sharpInstance.webp({ quality });
                break;
            default:
                sharpInstance = sharpInstance.jpeg({ quality });
        }
        return sharpInstance.toBuffer();
    }
    async uploadProfilePhoto(file, userId) {
        return this.uploadImage(file, `profiles/${userId}`, {
            width: 400,
            height: 400,
            quality: 85,
            format: 'jpeg'
        });
    }
    async uploadCoverImage(file, userId) {
        return this.uploadImage(file, `covers/${userId}`, {
            width: 1200,
            height: 400,
            quality: 85,
            format: 'jpeg'
        });
    }
    async uploadPostImage(file, userId) {
        return this.uploadImage(file, `posts/${userId}`, {
            width: 800,
            quality: 80,
            format: 'jpeg'
        });
    }
}
exports.fileUploadService = new FileUploadService();
//# sourceMappingURL=fileUploadService.js.map
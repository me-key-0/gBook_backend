"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadController_1 = require("@/controllers/uploadController");
const auth_1 = require("@/middleware/auth");
const fileUploadService_1 = require("@/services/fileUploadService");
const rateLimiter_1 = require("@/middleware/rateLimiter");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.use(rateLimiter_1.uploadLimiter);
router.post('/profile-photo', fileUploadService_1.fileUploadService.upload.single('photo'), uploadController_1.uploadController.uploadProfilePhoto);
router.post('/cover-image', fileUploadService_1.fileUploadService.upload.single('cover'), uploadController_1.uploadController.uploadCoverImage);
router.post('/post-image', fileUploadService_1.fileUploadService.upload.single('image'), uploadController_1.uploadController.uploadPostImage);
router.delete('/image/:filename', uploadController_1.uploadController.deleteImage);
exports.default = router;
//# sourceMappingURL=upload.js.map
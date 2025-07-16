import { Router } from "express";
import { authController } from "@/controllers/authController";
import { authenticate } from "@/middleware/auth";
import { validate, schemas } from "@/middleware/validation";
import { authLimiter } from "@/middleware/rateLimiter";
import upload from "@/middleware/multer";

const router = Router();

// Public routes
router.post(
  "/register",
  authLimiter,
  validate(schemas.register),
  authController.register
);
router.post("/submit-form", authLimiter, authController.submitForm);
router.get("/fetch-form", authLimiter, authController.fetchAnswers);
router.post("/verify-payment", authController.storeVerifiedPayment);

router.post(
  "/:userId/photo",
  upload.single("image"),
  authController.uploadPhoto
);
// POST /api/users/:userId/cover
router.post(
  "/:userId/cover",
  upload.single("image"),
  authController.uploadCoverImage
);
// GET /api/users/:userId/images
router.get("/:userId/images", authController.getUserImages);

router.post(
  "/login",
  authLimiter,
  validate(schemas.login),
  authController.login
);
router.post("/verify-otp", authController.verifyOtpController);
router.post("/forgot-password", authLimiter, authController.forgotPassword);
router.post("/reset-password", authLimiter, authController.resetPassword);
router.get("/verify-email/:token", authController.verifyEmail);

router.post("/resend-otp", authController.resendOtpController);

// Protected routes
router.use(authenticate);
router.get("/profile", authController.getProfile);
router.put(
  "/profile",
  validate(schemas.updateProfile),
  authController.updateProfile
);
router.post("/change-password", authController.changePassword);
router.post("/refresh-token", authController.refreshToken);
router.delete("/account", authController.deleteAccount);

export default router;

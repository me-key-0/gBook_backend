import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "@/models/User";
import { Campus } from "@/models/Campus";
import { College } from "@/models/College";
import { Department } from "@/models/Department";
import { ResponseHandler } from "@/utils/response";
import {
  AuthenticationError,
  ValidationError,
  ConflictError,
  InternalServerError,
  BadRequestError,
} from "@/utils/errors";
import { logger } from "@/utils/logger";
import { asyncHandler } from "@/middleware/errorHandler";
import {
  AuthenticatedRequest,
  RegisterValidation,
  LoginValidation,
} from "@/types";
import { Otp } from "@/models/Otp";
import { emailService } from "@/services/emailService";
import { Answer } from "@/models/Answer";
import { Question } from "@/models/Question";

interface UserResponse {
  userId: string;
  responses: {
    question: string;
    answer: string;
  }[];
}

class AuthController {
  register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const {
        firstName,
        lastName,
        username,
        email,
        password,
        phoneNumber,
        role,
      }: RegisterValidation = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        if (existingUser.email === email) {
          throw new ConflictError("Email already registered");
        }
        if (existingUser.username === username) {
          throw new ConflictError("Username already taken");
        }
      }

      // Create user
      const user = await User.create({
        firstName,
        lastName,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password,
        phoneNumber,
        role,
        isVerified: false, // Guests are auto-verified
        profileCompleted: role === "guest", // Guests don't need profile completion
      });

      // Generate OTP using the model's static method
      const otp = Otp.generateOTP();

      // Create OTP object and save to DB
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
      const otpDocument = await Otp.create({
        user: user._id, // Reference to the user
        email: user.email,
        otp,
        expiresAt: otpExpiresAt,
        type: "email_verification", // This OTP is for email verification
      });

      // Send OTP email to user
      const otpData = {
        firstName: user.firstName,
        lastName: user.lastName,
        otp,
        expiresInMinutes: 10, // OTP expiration time
      };

      const otpSent = await emailService.sendOtpEmail(user.email, otpData);

      if (!otpSent) {
        throw new InternalServerError("Failed to send OTP email");
      }

      // Remove password from response
      const userResponse = user.toJSON();

      logger.info(`New user registered: ${email} (${role})`);

      // Send the response with the user data and the generated token
      ResponseHandler.created(
        res,
        {
          user: {
            firstname: firstName,
            lastname: lastName,
            role,
            username,
            email,
            isVerified: false,
          },
          requiresProfileCompletion:
            role === "graduate" && !user.profileCompleted,
        },
        "Registration successful. Please verify your email."
      );
    }
  );

  submitForm = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId, answers } = req.body;

      if (!userId || !answers) {
        res.status(400).json({ message: "UserId and answers are required" });
        return;
      }

      // Validate answers
      const invalidAnswer = answers.find(
        (answer: { questionId: string; answer: string }) =>
          answer.answer.length > 500
      );

      if (invalidAnswer) {
        res.status(400).json({
          message: `Answer for question ${invalidAnswer.questionId} is too long. Max length is 500 characters.`,
        });
        return;
      }

      // Optional: Check if user exists (if userId is valid)
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Create and save the answers
      const savedAnswers = await Answer.insertMany(
        answers.map((answer: { questionId: string; answer: string }) => ({
          userId,
          questionId: answer.questionId,
          answer: answer.answer,
        }))
      );

      // Return the success response with the saved answers
      res.status(200).json({
        message: "Form submitted successfully",
        answers: savedAnswers,
      });
    }
  );

  fetchAnswers = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;

      // Fetch all questions from the Question model
      const questions = await Question.find().select("question -_id"); // Only the 'question' field

      // Fetch all answers for the given user
      const answers = await Answer.find()
        .populate({
          path: "questionId", // This is the reference to the Question model in the Answer model
          select: "question -_id", // We only want the question field (exclude '_id')
        })
        .lean();

      console.log("answers", answers);
      try {
        const groupedByUser: Record<string, UserResponse> = {};

        for (const ans of answers) {
          const userId = ans.userId.toString();
          const questionText = ans.questionId?.question || "Unknown question";

          if (!groupedByUser[userId]) {
            groupedByUser[userId] = {
              userId,
              responses: [],
            };
          }

          groupedByUser[userId].responses.push({
            question: questionText,
            answer: ans.answer,
          });
        }

        const responseArray: UserResponse[] = Object.values(groupedByUser);
        res.json(responseArray);
      } catch (error) {
        console.error("Error fetching answers:", error);
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  verifyOtpController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, otp } = req.body;

      // Find the OTP document based on email and the OTP
      const otpRecord = await Otp.findValidOTP(
        email,
        otp,
        "email_verification"
      );

      if (!otpRecord) {
        throw new BadRequestError("Invalid or expired OTP");
      }

      // Mark OTP as used
      await otpRecord.markAsUsed();

      // Find the user and update their verification status
      const user = await User.findOne({ email }).exec();

      if (!user) {
        throw new InternalServerError("User not found");
      }

      user.isVerified = true;
      await user.save();

      // Respond with success message
      ResponseHandler.success(
        res,
        {
          message: "OTP successfully verified. Your account is now activated.",
        },
        "Account verified"
      );
    }
  );

  resendOtpController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body;

      // Find the existing OTP for the user and check if it is expired
      const existingOtp = await Otp.findOne({
        email,
        isUsed: false,
        expiresAt: { $gt: new Date() },
      }).exec();

      if (existingOtp) {
        throw new ConflictError(
          "An OTP is already pending or not expired yet."
        );
      }

      // Generate new OTP
      const otp = Otp.generateOTP();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Create OTP document and save it
      const otpDocument = await Otp.create({
        email,
        otp,
        expiresAt: otpExpiresAt,
        type: "email_verification",
      });

      // Send new OTP email
      const otpData = {
        firstName: "User", // Assuming a generic user name for the moment
        lastName: "",
        otp,
        expiresInMinutes: 10,
      };

      const otpSent = await emailService.sendOtpEmail(email, otpData);

      if (!otpSent) {
        throw new InternalServerError("Failed to send OTP email");
      }

      ResponseHandler.success(
        res,
        { message: "A new OTP has been sent to your email." },
        "OTP resent"
      );
    }
  );

  public login = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, password }: LoginValidation = req.body;

      // Find user with password
      const user = await User.findOne({ email: email.toLowerCase() })
        .select("+password")
        .populate("campus college department", "name");

      if (!user) {
        throw new AuthenticationError("Invalid email or password");
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AuthenticationError("Invalid email or password");
      }

      // Check if account is active
      if (!user.isActive) {
        throw new AuthenticationError("Account is deactivated");
      }

      // Generate token
      const token = user.generateAuthToken();

      // Update last active
      user.updateLastActive();

      // Remove password from response
      const userResponse = user.toJSON();

      logger.info(`User logged in: ${email}`);

      ResponseHandler.success(
        res,
        {
          user: userResponse,
          token,
          requiresProfileCompletion:
            user.role === "graduate" && !user.profileCompleted,
        },
        "Login successful"
      );
    }
  );

  public getProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const user = await User.findById(req.userId)
        .populate("campus college department", "name")
        .populate("likes", "firstName lastName surname username photo")
        .populate("savedProfiles", "firstName lastName surname username photo");

      if (!user) {
        throw new AuthenticationError("User not found");
      }

      ResponseHandler.success(res, user, "Profile retrieved successfully");
    }
  );

  public updateProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const allowedUpdates = [
        "firstName",
        "lastName",
        "surname",
        "quote",
        "phoneNumber",
        "socialLinks",
        "privacySettings",
      ];

      const updates = Object.keys(req.body);
      const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
      );

      if (!isValidOperation) {
        throw new ValidationError("Invalid updates");
      }

      const user = await User.findByIdAndUpdate(
        req.userId,
        { ...req.body, profileCompleted: true },
        { new: true, runValidators: true }
      ).populate("campus college department", "name");

      if (!user) {
        throw new AuthenticationError("User not found");
      }

      logger.info(`Profile updated for user: ${user.email}`);

      ResponseHandler.success(res, user, "Profile updated successfully");
    }
  );

  public changePassword = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.userId).select("+password");
      if (!user) {
        throw new AuthenticationError("User not found");
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        throw new AuthenticationError("Current password is incorrect");
      }

      // Update password
      user.password = newPassword;
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);

      ResponseHandler.success(res, null, "Password changed successfully");
    }
  );

  public deleteAccount = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { password } = req.body;

      const user = await User.findById(req.userId).select("+password");
      if (!user) {
        throw new AuthenticationError("User not found");
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AuthenticationError("Password is incorrect");
      }

      // Soft delete - deactivate account
      user.isActive = false;
      await user.save();

      logger.info(`Account deactivated for user: ${user.email}`);

      ResponseHandler.success(res, null, "Account deleted successfully");
    }
  );

  public refreshToken = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const user = await User.findById(req.userId);
      if (!user) {
        throw new AuthenticationError("User not found");
      }

      const token = user.generateAuthToken();

      ResponseHandler.success(res, { token }, "Token refreshed successfully");
    }
  );

  public verifyEmail = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { token } = req.params;

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        const user = await User.findById(decoded.id);
        if (!user) {
          throw new AuthenticationError("Invalid verification token");
        }

        if (user.isVerified) {
          ResponseHandler.success(res, null, "Email already verified");
          return;
        }

        user.isVerified = true;
        await user.save();

        logger.info(`Email verified for user: ${user.email}`);

        ResponseHandler.success(res, null, "Email verified successfully");
      } catch (error) {
        throw new AuthenticationError("Invalid or expired verification token");
      }
    }
  );

  public forgotPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // Don't reveal if email exists
        ResponseHandler.success(
          res,
          null,
          "If email exists, reset instructions have been sent"
        );
        return;
      }

      // Generate reset token
      const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });

      // In production, send email with reset link
      // For now, just log it
      logger.info(`Password reset token for ${email}: ${resetToken}`);

      ResponseHandler.success(
        res,
        null,
        "If email exists, reset instructions have been sent"
      );
    }
  );

  public resetPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { token, newPassword } = req.body;

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        const user = await User.findById(decoded.id);
        if (!user) {
          throw new AuthenticationError("Invalid reset token");
        }

        user.password = newPassword;
        await user.save();

        logger.info(`Password reset for user: ${user.email}`);

        ResponseHandler.success(res, null, "Password reset successfully");
      } catch (error) {
        throw new AuthenticationError("Invalid or expired reset token");
      }
    }
  );
}

export const authController = new AuthController();

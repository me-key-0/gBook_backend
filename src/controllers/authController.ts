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
import { Question } from "@/models/Question";
import { firebaseService } from "@/config/firebase";
import { Answer } from "@/models/Answer";
import {cloudinaryService} from "@/services/cloudinaryService"
import { DISCOUNT_LIMIT, BASE_PRICE, DISCOUNT_RATE, EXPECTED_ACCOUNT } from '@/config/constants';
import { Payment } from "@/models/Payment";
import dayjs from "dayjs";

interface UserResponse {
  userId: string;
  responses: {
    question: string;
    answer: string;
  }[];
}

interface MulterRequest extends Request {
  file?: Express.Multer.File;
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

  uploadPhoto = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId;

  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  try {
    const photoUrl = await cloudinaryService.uploadBuffer(
      req.file.buffer,
      req.file.originalname
    );

    user.photo = photoUrl;
    await user.save();

    res.status(200).json({
      message: "Profile photo uploaded successfully",
      photoUrl,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
});


  // // Upload cover image
  // uploadCoverImage = asyncHandler(async (req: Request, res: Response) => {
  //   const userId = req.params.userId;

  //   if (!req.file) {
  //     res.status(400).json({ message: "No file uploaded" });
  //     return;
  //   }

  //   const user = await User.findById(userId);
  //   if (!user) {
  //     res.status(404).json({ message: "User not found" });
  //     return;
  //   }

  //   const url = await firebaseService.uploadFileToStorage(
  //     req.file.buffer,
  //     req.file.originalname,
  //     req.file.mimetype
  //   );

  //   user.coverImage = url;
  //   await user.save();

  //   res
  //     .status(200)
  //     .json({ message: "Cover image uploaded", coverImageUrl: url });
  // });

  uploadCoverImage = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId;

  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  try {
    const coverImageUrl = await cloudinaryService.uploadBuffer(
      req.file.buffer,
      req.file.originalname,
      "userCoverImages" // custom folder for separation
    );

    user.coverImage = coverImageUrl;
    await user.save();

    res.status(200).json({
      message: "Cover image uploaded successfully",
      coverImageUrl,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
});

  // Get user photo URLs
  getUserImages = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.userId).select(
      "photo coverImage"
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      photo: user.photo,
      coverImage: user.coverImage,
    });
  });

  submitForm = asyncHandler(
    async (req: MulterRequest, res: Response): Promise<void> => {
      const { userId, answers } = req.body;

      if (!userId || !answers) {
        res.status(400).json({ message: "UserId and answers are required" });
        return;
      }

      // Validate user exists
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Parse answers (in case sent as a JSON string via multipart/form-data)
      let parsedAnswers;
      try {
        parsedAnswers =
          typeof answers === "string" ? JSON.parse(answers) : answers;
      } catch (err) {
        res.status(400).json({ message: "Invalid answers format" });
        return;
      }

      // Validate each answer
      const invalidAnswer = parsedAnswers.find(
        (answer: { questionId: string; answer: string }) =>
          answer.answer.length > 500
      );
      if (invalidAnswer) {
        res.status(400).json({
          message: `Answer for question ${invalidAnswer.questionId} is too long. Max length is 500 characters.`,
        });
        return;
      }

      // Upload photo to Firebase if provided
      let photoUrl: string | null = null;

      if (req.file) {
        const file = req.file;
        const firebaseFile = firebaseService
          .getBucket()
          .file(`profilePhotos/${uuidv4()}_${file.originalname}`);
        const stream = firebaseFile.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        await new Promise<void>((resolve, reject) => {
          stream.on("error", reject);
          stream.on("finish", resolve);
          stream.end(file.buffer);
        });

        const [url] = await firebaseFile.getSignedUrl({
          action: "read",
          expires: "03-01-2500",
        });

        photoUrl = url;
      }

      // Save answers to MongoDB
      const savedAnswers = await Answer.insertMany(
        parsedAnswers.map((answer: { questionId: string; answer: string }) => ({
          userId,
          questionId: answer.questionId,
          answer: answer.answer,
        }))
      );

      res.status(200).json({
        message: "Form submitted successfully",
        answers: savedAnswers,
        ...(photoUrl && { photoUrl }),
      });
    }
  );

  // ............

  // submitForm = asyncHandler(
  //   async (req: Request, res: Response): Promise<void> => {
  //     const { userId, answers } = req.body;
  //     // const answers = req.body.answers as {
  //     //   questionId: string;
  //     //   answer: string;
  //     //   file?: Express.Multer.File;
  //     // }[];
  //     console.log("userId",userId);
  //     console.log("answers",answers);

  //     if (!userId || !answers || !Array.isArray(answers)) {
  //       res.status(400).json({ message: "userId and answers are required." });
  //       return;
  //     }

  //     // Verify user exists
  //     const user = await User.findById(userId);
  //     if (!user) {
  //       res.status(404).json({ message: "User not found" });
  //       return;
  //     }

  //     const storage = firebaseService.getBucket();

  //     const savedAnswers = [];

  //     for (const ans of answers) {
  //       if (!ans.answer && !ans.file) {
  //         continue; // skip empty answer
  //       }

  //       let finalAnswer = ans.answer;
  //       let mediaMeta;

  //       // Handle file upload if present
  //       if (ans.file) {
  //         const fileName = `${userId}_${Date.now()}_${ans.file.originalname}`;
  //         const file = storage.file(`yearbook/${fileName}`);
  //         await file.save(ans.file.buffer, {
  //           metadata: {
  //             contentType: ans.file.mimetype,
  //           },
  //         });

  //         const [url] = await file.getSignedUrl({
  //           action: "read",
  //           expires: "03-01-2030", // long-term URL
  //         });

  //         finalAnswer = url;
  //         mediaMeta = {
  //           fileName: fileName,
  //           contentType: ans.file.mimetype,
  //         };
  //       } else if (ans.answer.length > 500) {
  //         res.status(400).json({
  //           message: `Answer for question ${ans.questionId} is too long. Max 500 characters.`,
  //         });
  //         return;
  //       }

  //       const saved = await Answer.create({
  //         userId,
  //         questionId: ans.questionId,
  //         answer: finalAnswer,
  //         mediaMeta,
  //       });

  //       savedAnswers.push(saved);
  //     }

  //     logger.info(`User ${userId} submitted ${savedAnswers.length} answers`);

  //     res.status(200).json({
  //       message: "Form submitted successfully",
  //       answers: savedAnswers,
  //     });
  //   }
  // );

  // submitForm = asyncHandler(
  //   async (req: Request, res: Response): Promise<void> => {
  //     const { userId } = req.body;

  //     if (!userId) {
  //       res.status(400).json({ message: "userId is required." });
  //       return;
  //     }

  //     // Parse answers JSON string
  //     let answers: {
  //       questionId: string;
  //       answer?: string;
  //     }[];

  //     try {
  //       answers = JSON.parse(req.body.answers);
  //     } catch (error) {
  //       res.status(400).json({ message: "Invalid answers JSON format." });
  //       return;
  //     }

  //     if (!answers || !Array.isArray(answers)) {
  //       res.status(400).json({ message: "Answers must be an array." });
  //       return;
  //     }

  //     // Verify user exists
  //     const user = await User.findById(userId);
  //     if (!user) {
  //       res.status(404).json({ message: "User not found" });
  //       return;
  //     }

  //     const storage = firebaseService
  //       .getStorage()
  //       .bucket(process.env.FIREBASE_STORAGE_BUCKET!);

  //     // req.files is expected to be an array of files from multer with 'fieldname' = questionId
  //     // e.g. multer setup: upload.array('files') or upload.fields([{name: questionId1}, {name: questionId2}, ...])
  //     const files: Express.Multer.File[] = Array.isArray(req.files)
  //       ? req.files
  //       : Object.values(req.files || {}).flat();

  //     const savedAnswers = [];

  //     for (const ans of answers) {
  //       if (
  //         (!ans.answer || ans.answer.trim() === "") &&
  //         !files.find((f) => f.fieldname === ans.questionId)
  //       ) {
  //         // skip empty answer and no file
  //         continue;
  //       }

  //       if (ans.answer && ans.answer.length > 500) {
  //         res.status(400).json({
  //           message: `Answer for question ${ans.questionId} is too long. Max 500 characters.`,
  //         });
  //         return;
  //       }

  //       let mediaMeta = undefined;

  //       // Find file that matches this questionId
  //       const fileForAnswer = files.find((f) => f.fieldname === ans.questionId);

  //       let finalAnswer = ans.answer || "";

  //       if (fileForAnswer) {
  //         const fileName = `${userId}_${Date.now()}_${
  //           fileForAnswer.originalname
  //         }`;
  //         const file = storage.file(`yearbook/${fileName}`);

  //         await file.save(fileForAnswer.buffer, {
  //           metadata: {
  //             contentType: fileForAnswer.mimetype,
  //           },
  //         });

  //         const [url] = await file.getSignedUrl({
  //           action: "read",
  //           expires: "03-01-2030",
  //         });

  //         mediaMeta = {
  //           url,
  //           fileName,
  //           contentType: fileForAnswer.mimetype,
  //           size: fileForAnswer.size,
  //         };

  //         // Optionally, if you want to store the URL as the answer text:
  //         // finalAnswer = url;
  //       }

  //       const saved = await Answer.create({
  //         userId,
  //         questionId: ans.questionId,
  //         answer: finalAnswer,
  //         mediaMeta,
  //       });

  //       savedAnswers.push(saved);
  //     }

  //     logger.info(`User ${userId} submitted ${savedAnswers.length} answers`);

  //     res.status(200).json({
  //       message: "Form submitted successfully",
  //       answers: savedAnswers,
  //     });
  //   }
  // );

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

  

  public storeVerifiedPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    payerName,
    payerTelebirrNo,
    creditedPartyName,
    creditedPartyAccountNo,
    transactionStatus,
    serviceFee,
    receiptNo,
    paymentDate,
    settledAmount,
    totalPaidAmount,
  } = req.body;

  const userId = req.userId!;
  console.log(userId);

  // 1. Check if already used
  const existing = await Payment.findOne({ receiptNo });
  if (existing) {
    return ResponseHandler.conflict(res, 'This transaction ID has already been used.');
  }

  // 2. Check correct receiver
  if (creditedPartyAccountNo !== EXPECTED_ACCOUNT) {
    return ResponseHandler.badRequest(res, 'Transaction was not sent to the correct account.');
  }

  // 3. Check month
  const now = dayjs();
  const paidAt = dayjs(paymentDate);
  if (!paidAt.isValid() || !(now.isSame(paidAt, 'month') && now.isSame(paidAt, 'year'))) {
    return ResponseHandler.badRequest(res, 'Transaction is not from the current month.');
  }

  // 4. Determine applicable price
  const totalSuccessfulPayments = await Payment.countDocuments();
  const discountApplied = totalSuccessfulPayments < DISCOUNT_LIMIT;
  const expectedAmount = discountApplied
    ? BASE_PRICE * (1 - DISCOUNT_RATE)
    : BASE_PRICE;

  if (parseFloat(settledAmount) !== expectedAmount) {
    return ResponseHandler.badRequest(res, `Expected amount: ${expectedAmount} ETB`);
  }

  // 5. Save
  const payment = await Payment.create({
    payerName,
    payerTelebirrNo,
    creditedPartyName,
    creditedPartyAccountNo,
    transactionStatus,
    serviceFee,
    receiptNo,
    paymentDate,
    settledAmount,
    totalPaidAmount,
    discountApplied,
    finalAmount: expectedAmount,
    user: userId,
  });

  return ResponseHandler.created(res, payment, discountApplied
    ? '✅ Payment recorded with 25% discount!'
    : '✅ Payment recorded successfully.');
});

public checkDiscountEligibility = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId!;

    // Check if user already paid
    const existingPayment = await Payment.findOne({ user: userId });
    if (existingPayment) {
      ResponseHandler.success(res, {
        eligible: false,
        amount: existingPayment.finalAmount,
        message: "You have already paid.",
      });
      return
    }

    // Count how many successful payments exist
    const totalSuccessfulPayments = await Payment.countDocuments();

    const discountApplied = totalSuccessfulPayments < DISCOUNT_LIMIT;
    const amountToPay = discountApplied
      ? BASE_PRICE * (1 - DISCOUNT_RATE)
      : BASE_PRICE;

    ResponseHandler.success(res, {
      eligible: discountApplied,
      amount: amountToPay,
      message: discountApplied
        ? `🎉 You're eligible for a 25% discount! Pay ${amountToPay} ETB.`
        : `You are not eligible for a discount. Pay ${amountToPay} ETB.`,
    });
  }
);



}

export const authController = new AuthController();
function uuidv4() {
  throw new Error("Function not implemented.");
}

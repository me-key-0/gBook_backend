import mongoose, { Model, Schema } from "mongoose";
import { IOtp } from "@/types";

interface IOtpModel extends Model<IOtp> {
  generateOTP: () => string;
  findValidOTP: (
    email: string,
    otp: string,
    type: string
  ) => Promise<IOtp | null>;
}

const otpSchema = new Schema<IOtp>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: [true, "OTP is required"],
      length: 6,
    },
    type: {
      type: String,
      enum: ["email_verification", "password_reset"],
      required: [true, "OTP type is required"],
      default: "email_verification",
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration time is required"],
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
      max: [5, "Maximum 5 attempts allowed"],
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
otpSchema.index({ user: 1, type: 1 });
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired OTPs
otpSchema.index({ otp: 1, isUsed: 1 });

// Method to check if OTP is valid
otpSchema.methods.isValid = function (): boolean {
  return !this.isUsed && this.expiresAt > new Date() && this.attempts < 5;
};

// Method to mark OTP as used
otpSchema.methods.markAsUsed = function () {
  this.isUsed = true;
  return this.save();
};

// Method to increment attempts
otpSchema.methods.incrementAttempts = function () {
  this.attempts += 1;
  return this.save();
};

// Static method to generate random OTP
otpSchema.statics.generateOTP = function (): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to find valid OTP
otpSchema.statics.findValidOTP = function (
  email: string,
  otp: string,
  type: string = "email_verification"
) {
  return this.findOne({
    email,
    otp,
    type,
    isUsed: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 5 },
  });
};

export const Otp = mongoose.model<IOtp, IOtpModel>("Otp", otpSchema);

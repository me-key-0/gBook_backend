import { IAnswer } from "@/types";
import mongoose, { Schema } from "mongoose";

const answerSchema = new Schema<IAnswer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Assuming you have a User model
      required: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question", // References the Question model
      required: true,
    },
    answer: {
      type: String,
      required: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

export const Answer = mongoose.model<IAnswer>("Answer", answerSchema);

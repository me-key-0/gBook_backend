import { IAnswer } from "@/types";
import mongoose, { Schema } from "mongoose";

const answerSchema = new Schema<IAnswer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    answer: {
      type: String,
      maxlength: 500,
      // not always required (can be empty if file is provided)
    },
  },
  { timestamps: true }
);

export const Answer = mongoose.model<IAnswer>("Answer", answerSchema);

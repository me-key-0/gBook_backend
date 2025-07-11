import mongoose from "mongoose"; // Import your Question model (adjust path)
import dotenv from "dotenv";
import { Question } from "@/models/Question";

dotenv.config();

const questionsData = [
  { question: "Nick name?", category: "profile", order: 1 },
  { question: "Express urself in 3 words.", category: "profile", order: 2 },
  { question: "Frequent word?", category: "profile", order: 3 },
  { question: "Fed up with?", category: "profile", order: 4 },
  { question: "Addicted to?", category: "profile", order: 5 },
  { question: "Will miss a lot?", category: "profile", order: 6 },
  { question: "Will never forget?", category: "profile", order: 7 },
  { question: "Die for?", category: "profile", order: 8 },
  { question: "Favorite quote?", category: "profile", order: 9 },
  { question: "Aspired to be?", category: "profile", order: 10 },
  { question: "Best lecturer ever?", category: "profile", order: 11 },
  { question: "After 10 years?", category: "profile", order: 12 },
  { question: "Afraid of?", category: "profile", order: 13 },
  { question: "Who do u think is fun?", category: "profile", order: 14 },
  { question: "Who do u think is shy?", category: "profile", order: 15 },
  { question: "Who do u think is restless?", category: "profile", order: 16 },
  {
    question: "Who do u think is food-fighter?",
    category: "profile",
    order: 17,
  },
  { question: "Gratitude", category: "profile", order: 18 },
  { question: "Last word", category: "profile", order: 19 },
  { question: "Phobia", category: "profile", order: 20 },
  { question: "Aspire to be..", category: "profile", order: 21 },
  {
    question:
      "If u compare ur self with an animal, which one would it be and why?",
    category: "profile",
    order: 22,
  },
];

const populateQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      //   useNewUrlParser: true,
      //   useUnifiedTopology: true,
    });

    // Create questions
    const questions = questionsData.map((data) => ({
      ...data,
      type: "profile", // All questions will be of 'profile' type
      isRequired: true,
      isActive: true,
    }));

    await Question.insertMany(questions);
    console.log("Questions populated successfully");
    mongoose.disconnect();
  } catch (error) {
    console.error("Error populating questions:", error);
  }
};

populateQuestions();

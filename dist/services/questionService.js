"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionService = void 0;
const Question_1 = require("@/models/Question");
const logger_1 = require("@/utils/logger");
class QuestionService {
    async getQuestionsByType(type) {
        try {
            const questions = await Question_1.Question.find({
                type,
                isActive: true
            }).sort({ order: 1, createdAt: 1 });
            return questions;
        }
        catch (error) {
            logger_1.logger.error('Error fetching questions by type:', error);
            throw error;
        }
    }
    async getRequiredQuestions() {
        try {
            const questions = await Question_1.Question.find({
                isRequired: true,
                isActive: true
            }).sort({ order: 1 });
            return questions;
        }
        catch (error) {
            logger_1.logger.error('Error fetching required questions:', error);
            throw error;
        }
    }
    async getQuestionsByCategory(category) {
        try {
            const questions = await Question_1.Question.find({
                category,
                isActive: true
            }).sort({ order: 1, createdAt: 1 });
            return questions;
        }
        catch (error) {
            logger_1.logger.error('Error fetching questions by category:', error);
            throw error;
        }
    }
    async getRandomQuestions(type, limit = 5) {
        try {
            const questions = await Question_1.Question.aggregate([
                { $match: { type, isActive: true } },
                { $sample: { size: limit } }
            ]);
            return questions;
        }
        catch (error) {
            logger_1.logger.error('Error fetching random questions:', error);
            throw error;
        }
    }
    async createQuestion(questionData) {
        try {
            const question = await Question_1.Question.create(questionData);
            logger_1.logger.info(`Question created: ${question._id}`);
            return question;
        }
        catch (error) {
            logger_1.logger.error('Error creating question:', error);
            throw error;
        }
    }
    async updateQuestion(questionId, updates) {
        try {
            const question = await Question_1.Question.findByIdAndUpdate(questionId, updates, { new: true, runValidators: true });
            if (question) {
                logger_1.logger.info(`Question updated: ${questionId}`);
            }
            return question;
        }
        catch (error) {
            logger_1.logger.error('Error updating question:', error);
            throw error;
        }
    }
    async deleteQuestion(questionId) {
        try {
            const result = await Question_1.Question.findByIdAndUpdate(questionId, { isActive: false }, { new: true });
            if (result) {
                logger_1.logger.info(`Question deleted: ${questionId}`);
                return true;
            }
            return false;
        }
        catch (error) {
            logger_1.logger.error('Error deleting question:', error);
            throw error;
        }
    }
    async getQuestionCategories() {
        try {
            const categories = await Question_1.Question.distinct('category', { isActive: true });
            return categories;
        }
        catch (error) {
            logger_1.logger.error('Error fetching question categories:', error);
            throw error;
        }
    }
}
exports.questionService = new QuestionService();
//# sourceMappingURL=questionService.js.map
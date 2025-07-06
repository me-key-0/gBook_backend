"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionController = void 0;
const Question_1 = require("@/models/Question");
const response_1 = require("@/utils/response");
const errors_1 = require("@/utils/errors");
const logger_1 = require("@/utils/logger");
const errorHandler_1 = require("@/middleware/errorHandler");
class QuestionController {
    constructor() {
        this.getQuestions = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { type, category, isActive } = req.query;
            const filter = {};
            if (type)
                filter.type = type;
            if (category)
                filter.category = category;
            if (isActive !== undefined)
                filter.isActive = isActive === 'true';
            const questions = await Question_1.Question.find(filter)
                .sort({ order: 1, createdAt: -1 });
            response_1.ResponseHandler.success(res, questions, 'Questions retrieved successfully');
        });
        this.getQuestionsByType = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { type } = req.params;
            if (!['lastword', 'profile', 'post'].includes(type)) {
                throw new errors_1.ValidationError('Invalid question type');
            }
            const questions = await Question_1.Question.find({
                type,
                isActive: true
            }).sort({ order: 1, createdAt: 1 });
            response_1.ResponseHandler.success(res, questions, `${type} questions retrieved successfully`);
        });
        this.getQuestionsByCategory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { category } = req.params;
            const questions = await Question_1.Question.find({
                category,
                isActive: true
            }).sort({ order: 1, createdAt: 1 });
            response_1.ResponseHandler.success(res, questions, `Questions for category ${category} retrieved successfully`);
        });
        this.getRequiredQuestions = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const questions = await Question_1.Question.find({
                isRequired: true,
                isActive: true
            }).sort({ order: 1 });
            response_1.ResponseHandler.success(res, questions, 'Required questions retrieved successfully');
        });
        this.getRandomQuestions = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { type, limit = 5 } = req.query;
            if (!type) {
                throw new errors_1.ValidationError('Question type is required');
            }
            const questions = await Question_1.Question.aggregate([
                { $match: { type, isActive: true } },
                { $sample: { size: parseInt(limit) } }
            ]);
            response_1.ResponseHandler.success(res, questions, 'Random questions retrieved successfully');
        });
        this.getQuestionCategories = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const categories = await Question_1.Question.distinct('category', { isActive: true });
            response_1.ResponseHandler.success(res, categories, 'Question categories retrieved successfully');
        });
        this.getQuestion = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const question = await Question_1.Question.findOne({ _id: id, isActive: true });
            if (!question) {
                throw new errors_1.NotFoundError('Question not found');
            }
            response_1.ResponseHandler.success(res, question, 'Question retrieved successfully');
        });
        this.createQuestion = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { question, type, category, isRequired, options, order } = req.body;
            const newQuestion = await Question_1.Question.create({
                question,
                type,
                category,
                isRequired,
                options,
                order
            });
            logger_1.logger.info(`Question created: ${newQuestion._id}`);
            response_1.ResponseHandler.created(res, newQuestion, 'Question created successfully');
        });
        this.updateQuestion = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const updates = req.body;
            const question = await Question_1.Question.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
            if (!question) {
                throw new errors_1.NotFoundError('Question not found');
            }
            logger_1.logger.info(`Question updated: ${id}`);
            response_1.ResponseHandler.success(res, question, 'Question updated successfully');
        });
        this.deleteQuestion = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const question = await Question_1.Question.findByIdAndUpdate(id, { isActive: false }, { new: true });
            if (!question) {
                throw new errors_1.NotFoundError('Question not found');
            }
            logger_1.logger.info(`Question deleted: ${id}`);
            response_1.ResponseHandler.success(res, null, 'Question deleted successfully');
        });
    }
}
exports.questionController = new QuestionController();
//# sourceMappingURL=questionController.js.map
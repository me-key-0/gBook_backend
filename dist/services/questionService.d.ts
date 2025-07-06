import { IQuestion } from '@/types';
declare class QuestionService {
    getQuestionsByType(type: 'lastword' | 'profile' | 'post'): Promise<IQuestion[]>;
    getRequiredQuestions(): Promise<IQuestion[]>;
    getQuestionsByCategory(category: string): Promise<IQuestion[]>;
    getRandomQuestions(type: string, limit?: number): Promise<IQuestion[]>;
    createQuestion(questionData: {
        question: string;
        type: 'lastword' | 'profile' | 'post';
        category: string;
        isRequired?: boolean;
        options?: string[];
        order?: number;
    }): Promise<IQuestion>;
    updateQuestion(questionId: string, updates: Partial<IQuestion>): Promise<IQuestion | null>;
    deleteQuestion(questionId: string): Promise<boolean>;
    getQuestionCategories(): Promise<string[]>;
}
export declare const questionService: QuestionService;
export {};
//# sourceMappingURL=questionService.d.ts.map
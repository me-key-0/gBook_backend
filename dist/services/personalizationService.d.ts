import { IUser, IPost } from '@/types';
declare class PersonalizationService {
    getPersonalizedFeed(userId: string, page?: number, limit?: number): Promise<{
        posts: IPost[];
        total: number;
        algorithm: string;
    }>;
    private getNewUserFeed;
    private getPersonalizedContent;
    getSuggestedUsers(userId: string, limit?: number): Promise<IUser[]>;
    updateUserInteraction(userId: string, interactionType: 'view' | 'like' | 'comment' | 'share', targetId: string, targetType: 'user' | 'post'): Promise<void>;
    private getTotalPersonalizedCount;
    getPopularContent(timeframe?: 'day' | 'week' | 'month', limit?: number): Promise<IPost[]>;
}
export declare const personalizationService: PersonalizationService;
export {};
//# sourceMappingURL=personalizationService.d.ts.map
import { ITag } from '@/types';
declare class TagService {
    getAllTags(): Promise<ITag[]>;
    getTagsByCategory(category: string): Promise<ITag[]>;
    getPopularTags(limit?: number): Promise<ITag[]>;
    searchTags(query: string): Promise<ITag[]>;
    createTag(tagData: {
        name: string;
        description?: string;
        category: string;
    }): Promise<ITag>;
    updateTag(tagId: string, updates: Partial<ITag>): Promise<ITag | null>;
    deleteTag(tagId: string): Promise<boolean>;
    incrementTagUsage(tagIds: string[]): Promise<void>;
    getTagCategories(): Promise<string[]>;
    getUserTags(userId: string): Promise<ITag[]>;
    getTagStats(): Promise<{
        totalTags: number;
        totalCategories: number;
        mostUsedTag: ITag | null;
        averageUsage: number;
    }>;
}
export declare const tagService: TagService;
export {};
//# sourceMappingURL=tagService.d.ts.map
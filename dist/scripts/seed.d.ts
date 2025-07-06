declare class DatabaseSeeder {
    private campusIds;
    private collegeIds;
    private departmentIds;
    private questionIds;
    private userIds;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    clearDatabase(): Promise<void>;
    seedCampuses(): Promise<void>;
    seedColleges(): Promise<void>;
    seedDepartments(): Promise<void>;
    seedQuestions(): Promise<void>;
    seedTags(): Promise<void>;
    seedUsers(): Promise<void>;
    seedPosts(): Promise<void>;
    seed(): Promise<void>;
}
export { DatabaseSeeder };
//# sourceMappingURL=seed.d.ts.map
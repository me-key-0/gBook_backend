declare class Database {
    private static instance;
    private isConnected;
    private constructor();
    static getInstance(): Database;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnectionActive(): boolean;
    getConnectionState(): string;
}
export declare const database: Database;
export {};
//# sourceMappingURL=database.d.ts.map
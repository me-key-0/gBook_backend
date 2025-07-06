declare class Server {
    private app;
    private server;
    private port;
    constructor();
    private initializeMiddleware;
    private initializeRoutes;
    private initializeErrorHandling;
    start(): Promise<void>;
    private setupGracefulShutdown;
}
declare const server: Server;
export default server;
//# sourceMappingURL=server.d.ts.map
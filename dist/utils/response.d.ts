import { Response } from 'express';
export declare class ResponseHandler {
    static success<T>(res: Response, data: T, message?: string, statusCode?: number): Response;
    static error(res: Response, message?: string, statusCode?: number, error?: string): Response;
    static paginated<T>(res: Response, data: T[], pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    }, message?: string, statusCode?: number): Response;
    static created<T>(res: Response, data: T, message?: string): Response;
    static noContent(res: Response, message?: string): Response;
    static badRequest(res: Response, message?: string, error?: string): Response;
    static unauthorized(res: Response, message?: string, error?: string): Response;
    static forbidden(res: Response, message?: string, error?: string): Response;
    static notFound(res: Response, message?: string, error?: string): Response;
    static conflict(res: Response, message?: string, error?: string): Response;
    static tooManyRequests(res: Response, message?: string, error?: string): Response;
    static internalError(res: Response, message?: string, error?: string): Response;
}
//# sourceMappingURL=response.d.ts.map
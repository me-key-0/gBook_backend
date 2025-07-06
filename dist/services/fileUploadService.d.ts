import multer from 'multer';
import { FileUploadResult, ImageProcessingOptions } from '@/types';
declare class FileUploadService {
    private storage;
    private fileFilter;
    upload: multer.Multer;
    uploadImage(file: Express.Multer.File, folder?: string, options?: ImageProcessingOptions): Promise<FileUploadResult>;
    deleteImage(filename: string): Promise<void>;
    private processImage;
    uploadProfilePhoto(file: Express.Multer.File, userId: string): Promise<FileUploadResult>;
    uploadCoverImage(file: Express.Multer.File, userId: string): Promise<FileUploadResult>;
    uploadPostImage(file: Express.Multer.File, userId: string): Promise<FileUploadResult>;
}
export declare const fileUploadService: FileUploadService;
export {};
//# sourceMappingURL=fileUploadService.d.ts.map
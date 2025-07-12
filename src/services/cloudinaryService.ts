// src/services/cloudinaryService.ts
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

class CloudinaryService {
  public async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    folder: string = "userImages"
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: fileName.split(".")[0],
          resource_type: "image",
        },
        (error, result) => {
          if (error) return reject(error);
          if (result?.secure_url) return resolve(result.secure_url);
          return reject(new Error("Upload failed"));
        }
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }
}

export const cloudinaryService = new CloudinaryService();

// src/middleware/upload.ts
import multer, { MulterError } from "multer";

// Store file in memory to use buffer directly
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    const error = new MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname);
    cb(error as any , false);
  }
}
});

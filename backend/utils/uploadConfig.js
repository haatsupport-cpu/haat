import fs from "fs";
import path from "path";
import multer from "multer";

export const uploadsDir = path.join(process.cwd(), "uploads");
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Original filenames are user input and must never be trusted for storage paths.
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname).toLowerCase();

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  // MIME filtering blocks non-image uploads before they become publicly reachable files.
  if (allowedMimeTypes.has(file.mimetype)) {
    return cb(null, true);
  }

  const error = new Error("Only JPEG, JPG, PNG, and WebP images are allowed");
  error.statusCode = 400;
  error.code = "INVALID_FILE_TYPE";
  return cb(error);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    // Size limits reduce abuse risk and prevent oversized requests from exhausting disk space.
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;
export { allowedMimeTypes };

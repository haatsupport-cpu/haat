import multer from "multer";

export const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image size must not exceed 5MB"
        : "Invalid image upload request";

    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (err?.code === "INVALID_FILE_TYPE") {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }

  return next(err);
};

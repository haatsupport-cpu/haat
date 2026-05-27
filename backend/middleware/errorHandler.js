import CONFIG from "../config/constants.js";

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.path,
    method: req.method,
  });
};

export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";

  if (CONFIG.VERBOSE_LOGS || status >= 500) {
    console.error("[ERROR]", {
      status,
      message,
      path: req.path,
      method: req.method,
      stack: CONFIG.isDevelopment ? err.stack : undefined,
    });
  }

  res.status(status).json({
    success: false,
    message,
    ...(CONFIG.isDevelopment && { error: err.message, stack: err.stack }),
  });
};

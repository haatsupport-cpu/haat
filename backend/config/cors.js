import CONFIG from "./constants.js";

const getDynamicAllowedOrigins = () => {
  const origins = [
    CONFIG.CLIENT_URL,
    CONFIG.FRONTEND_URL,

    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",

    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",

    "https://haat-nine.vercel.app",
    "https://haat-liart.vercel.app",
  ].filter(Boolean);

  if (CONFIG.ALLOWED_ORIGINS?.length) {
    origins.push(...CONFIG.ALLOWED_ORIGINS);
  }

  return [...new Set(origins)];
};

export const getCorsOptions = () => ({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = getDynamicAllowedOrigins();

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (/^https:\/\/haat-.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    if (
      CONFIG.isDevelopment &&
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }

    console.error("Blocked by CORS:", origin);

    return callback(
      new Error(`Origin ${origin} not allowed by CORS`),
      false
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Origin",
    "Content-Type",
    "Authorization",
    "Accept",
    "X-Requested-With",
  ],

  optionsSuccessStatus: 200,
  maxAge: 86400,
});

export default getCorsOptions;
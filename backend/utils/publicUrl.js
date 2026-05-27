import CONFIG from "../config/constants.js";

export const normalizeUploadPath = (value) => {
  if (!value) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/uploads/")) return raw;
  if (raw.startsWith("uploads/")) return `/${raw}`;
  return `/uploads/${raw.replace(/^\/+/, "")}`;
};

export const resolvePublicUrl = (value) => {
  const normalized = normalizeUploadPath(value);
  if (!normalized || /^https?:\/\//i.test(normalized)) return normalized;

  return `${CONFIG.API_BASE_URL.replace(/\/$/, "")}${normalized}`;
};

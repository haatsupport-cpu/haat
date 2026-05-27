import axios from "axios";

const AUTH_TOKEN_KEY = "authToken";
const trimTrailingSlash = (value) => value.replace(/\/$/, "");

const normalizeApiBaseUrl = (value) => {
  const raw = trimTrailingSlash(value || "/api");
  const withLeadingSlash = raw.startsWith("http") || raw.startsWith("/") ? raw : `/${raw}`;

  if (/\/api$/i.test(withLeadingSlash)) return withLeadingSlash;
  return `${withLeadingSlash}/api`;
};

const getOriginFromApiBaseUrl = (value) => {
  if (!/^https?:\/\//i.test(value)) return "";

  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
};

const API_BASE_URL = normalizeApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL
);
const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  getOriginFromApiBaseUrl(API_BASE_URL) ||
  (import.meta.env.DEV ? "http://localhost:5000" : window.location.origin);
const ASSET_BASE_URL = trimTrailingSlash(API_ORIGIN);

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
});

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    delete axiosClient.defaults.headers.common.Authorization;
  }
};

export const resolveAssetUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${ASSET_BASE_URL}${normalizedPath}`;
};

axiosClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      setAuthToken(null);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

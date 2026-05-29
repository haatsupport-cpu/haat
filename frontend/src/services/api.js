import axios from "axios";

const AUTH_TOKEN_KEY = "authToken";

/**
 * ENV API URL (must end with /api)
 */
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "https://haatonline-lhyy.onrender.com/api"
).replace(/\/$/, "");

/**
 * Asset base (backend origin only)
 */
const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

/**
 * Axios instance
 */
export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * TOKEN HANDLING
 */
export const getAuthToken = () =>
  localStorage.getItem(AUTH_TOKEN_KEY);

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    delete axiosClient.defaults.headers.common.Authorization;
  }
};

/**
 * ASSET URL FIX
 */
export const resolveAssetUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}${normalized}`;
};

/**
 * REQUEST INTERCEPTOR
 */
axiosClient.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * RESPONSE INTERCEPTOR
 */
axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      setAuthToken(null);
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
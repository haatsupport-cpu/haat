import api, {
  getAuthToken,
  resolveAssetUrl,
  setAuthToken,
} from "../services/api";

/**
 * Named exports
 */
export {
  getAuthToken,
  resolveAssetUrl,
  setAuthToken,
};

/**
 * Main axios instance
 */
export const axiosClient = api;

/**
 * Default export (optional)
 */
export default api;
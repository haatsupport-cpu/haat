import axiosClient from "./api";

export const authService = {
  login: (credentials) => axiosClient.post("/auth/login", credentials),
  register: (payload) => axiosClient.post("/auth/register", payload),
  getCurrentUser: () => axiosClient.get("/auth/me"),
  updateCurrentUser: (payload) => axiosClient.put("/auth/me", payload),
  changePassword: (payload) => axiosClient.put("/auth/change-password", payload),
  logout: () => axiosClient.post("/auth/logout"),
};

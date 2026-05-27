import axiosClient from "./api";

export const adminService = {
  getStats: () => axiosClient.get("/admin/stats"),
  getRecentOrders: () => axiosClient.get("/admin/recent-orders"),
  getCustomers: () => axiosClient.get("/admin/customers"),
};

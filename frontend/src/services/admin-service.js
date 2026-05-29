import axiosClient from "./api";

export const adminService = {
  getStats: () => axiosClient.get("/admin/stats"),
  getRecentOrders: () => axiosClient.get("/admin/recent-orders"),
  getCustomers: () => axiosClient.get("/admin/customers"),
  getPromos: () => axiosClient.get("/admin/promos"),
  createPromo: (payload) => axiosClient.post("/admin/promos", payload),
  updatePromo: (id, payload) => axiosClient.put(`/admin/promos/${id}`, payload),
  deletePromo: (id) => axiosClient.delete(`/admin/promos/${id}`),
  getPopupAds: () => axiosClient.get("/admin/popup-ads"),
  createPopupAd: (payload) => axiosClient.post("/admin/popup-ads", payload),
  updatePopupAd: (id, payload) => axiosClient.put(`/admin/popup-ads/${id}`, payload),
  deletePopupAd: (id) => axiosClient.delete(`/admin/popup-ads/${id}`),
};

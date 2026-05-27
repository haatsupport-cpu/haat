import axiosClient from "./api";

export const productService = {
  list: (config = {}) => axiosClient.get("/products", config),
  create: (payload) => axiosClient.post("/products", payload),
  update: (id, payload) => axiosClient.put(`/products/${id}`, payload),
  remove: (id) => axiosClient.delete(`/products/${id}`),
};

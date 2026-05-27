import axiosClient from "./api";

export const orderService = {
  list: () => axiosClient.get("/orders"),
  update: (id, payload) => axiosClient.put(`/orders/${id}`, payload),
};

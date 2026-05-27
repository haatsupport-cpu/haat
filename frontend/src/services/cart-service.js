import axiosClient from "./api";

const userParams = (userId) => (userId ? { params: { userId } } : undefined);

export const cartService = {
  getCart: (userId) => axiosClient.get("/cart", userParams(userId)),
  addItem: ({ userId, productId, quantity }) =>
    axiosClient.post("/cart", { userId, productId, quantity }),
  updateItemQuantity: (itemId, payload) => axiosClient.put(`/cart/${itemId}`, payload),
  removeItem: (itemId, userId) => axiosClient.delete(`/cart/${itemId}`, userParams(userId)),
};

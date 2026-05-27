import axiosClient from "./api";

export const checkoutService = {
  validatePromo: (payload) => axiosClient.post("/checkout/validate-promo", payload),
  createOrder: (payload) => axiosClient.post("/checkout/create-order", payload),
};

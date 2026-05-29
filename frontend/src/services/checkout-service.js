import axiosClient from "./api";

export const checkoutService = {
  validatePromo: (payload) => axiosClient.post("/checkout/validate-promo", payload),
  getMyPromos: () => axiosClient.get("/checkout/my-promos"),
  getPopupAd: () => axiosClient.get("/checkout/popup-ad"),
  createOrder: (payload) => axiosClient.post("/checkout/create-order", payload),
};

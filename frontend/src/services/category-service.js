import axiosClient from "./api";

export const categoryService = {
  list: () => axiosClient.get("/categories"),
};

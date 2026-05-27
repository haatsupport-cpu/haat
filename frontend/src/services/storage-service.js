import axiosClient from "./api";

export const storageService = {
  uploadImage: (formData) =>
    axiosClient.post("/storage/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

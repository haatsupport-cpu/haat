import { Menu, Package, Settings, ShoppingCart, Users } from "lucide-react";

export const orderStatusOptions = ["pending", "processing", "confirmed", "shipped", "delivered", "cancelled"];
export const orderPaymentOptions = ["pending", "paid", "failed", "refunded"];

export const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: <Menu size={18} /> },
  { id: "products", label: "Products", icon: <Package size={18} /> },
  { id: "orders", label: "Orders", icon: <ShoppingCart size={18} /> },
  { id: "customers", label: "Customers", icon: <Users size={18} /> },
  { id: "settings", label: "Settings", icon: <Settings size={18} /> },
];

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const PRODUCT_FORM_INITIAL = {
  name: "",
  category: "",
  price: "",
  stock: "",
  unit: "",
  tag: "",
  image: "",
  imageFile: null,
  imagePreview: "",
  imageError: "",
};

export const validateImageFile = (file) => {
  if (!file) return "";
  if (!file.type?.startsWith("image/")) return "Please select a valid image file.";
  if (file.size > MAX_IMAGE_SIZE) return "Image size must not exceed 5MB.";
  return "";
};

export const getUploadErrorMessage = (error) =>
  error?.response?.data?.message ||
  (error?.code === "ECONNABORTED" ? "Upload timed out. Please try again." : "Image upload failed. Please try again.");

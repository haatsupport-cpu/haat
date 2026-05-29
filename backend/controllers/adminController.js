import {
  getCustomers,
  getDashboardStats,
  getRecentOrders,
} from "../services/adminService.js";
import PromoCode from "../models/PromoCode.js";
import PopupAd from "../models/PopupAd.js";
import { toPopupResponse, toPromoResponse } from "../utils/adminPromoMapper.js";

export const getStats = async (req, res) => {
  const stats = await getDashboardStats();
  return res.json(stats);
};

export const listRecentOrders = async (req, res) => {
  const orders = await getRecentOrders();
  return res.json({ orders });
};

export const listCustomers = async (req, res) => {
  const customers = await getCustomers();
  return res.json(customers);
};

const normalizePromoPayload = (body = {}) => ({
  code: String(body.code || "").trim().toUpperCase(),
  description: String(body.description || "").trim(),
  discountType: body.discountType ?? "percentage",
  discountValue: Number(body.discountValue),
  minOrderAmount: Number(body.minimumOrderValue ?? body.minOrderAmount ?? 0),
  minimumOrderValue: Number(body.minimumOrderValue ?? body.minOrderAmount ?? 0),
  deliveryOptions: Array.isArray(body.deliveryOptions)
    ? body.deliveryOptions
    : ["instant", "scheduled"],
  expiresAt: body.expiryDate || body.expiresAt ? new Date(body.expiryDate || body.expiresAt) : null,
  expiryDate: body.expiryDate || body.expiresAt ? new Date(body.expiryDate || body.expiresAt) : null,
  isActive: Boolean(body.activeStatus ?? body.isActive),
  activeStatus: Boolean(body.activeStatus ?? body.isActive),
});

const validatePromoPayload = (payload) => {
  if (!payload.code) return "Promo code is required";
  if (!["percentage", "fixed"].includes(payload.discountType)) return "Discount type is invalid";
  if (!Number.isFinite(payload.discountValue) || payload.discountValue <= 0) return "Discount value must be greater than 0";
  if (payload.discountType === "percentage" && payload.discountValue > 100) return "Percentage discount cannot exceed 100";
  if (!Number.isFinite(payload.minOrderAmount) || payload.minOrderAmount < 0) return "Minimum order value cannot be negative";
  if (!payload.expiresAt || Number.isNaN(payload.expiresAt.getTime())) return "Valid expiry date is required";
  if (
    !Array.isArray(payload.deliveryOptions) ||
    payload.deliveryOptions.length === 0 ||
    payload.deliveryOptions.some((opt) => !["instant", "scheduled"].includes(opt))
  ) {
    return "Delivery options must be a non-empty array containing 'instant' and/or 'scheduled'";
  }
  return null;
};

export const listPromos = async (req, res) => {
  const promos = await PromoCode.find({}).sort({ createdAt: -1 }).lean();
  return res.json({ promos: (promos ?? []).map(toPromoResponse) });
};

export const createPromo = async (req, res) => {
  const payload = normalizePromoPayload(req.body);
  const error = validatePromoPayload(payload);
  if (error) return res.status(400).json({ message: error });

  const duplicate = await PromoCode.findOne({ code: payload.code }).lean();
  if (duplicate) return res.status(409).json({ message: "Promo code already exists" });

  const promo = await PromoCode.create(payload);
  return res.status(201).json({ promo: toPromoResponse(promo) });
};

export const updatePromo = async (req, res) => {
  const payload = normalizePromoPayload(req.body);
  const error = validatePromoPayload(payload);
  if (error) return res.status(400).json({ message: error });

  const duplicate = await PromoCode.findOne({ code: payload.code, _id: { $ne: req.params.id } }).lean();
  if (duplicate) return res.status(409).json({ message: "Promo code already exists" });

  const promo = await PromoCode.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!promo) return res.status(404).json({ message: "Promo code not found" });
  return res.json({ promo: toPromoResponse(promo) });
};

export const deletePromo = async (req, res) => {
  const promo = await PromoCode.findByIdAndDelete(req.params.id);
  if (!promo) return res.status(404).json({ message: "Promo code not found" });
  return res.json({ message: "Promo code deleted" });
};

const normalizePopupPayload = (body = {}) => ({
  title: String(body.title || "").trim(),
  description: String(body.description || body.textContent || "").trim(),
  textContent: String(body.textContent || body.description || "").trim(),
  image: String(body.image || body.imageUrl || "").trim(),
  imageUrl: String(body.imageUrl || body.image || "").trim(),
  targetLink: String(body.targetLink || "").trim(),
  isActive: Boolean(body.isActive),
});

const validatePopupPayload = (payload) => {
  if (!payload.imageUrl && !payload.image && !payload.textContent && !payload.description) return "Popup image or text content is required";
  if (payload.targetLink) {
    try {
      const url = new URL(payload.targetLink);
      if (!["http:", "https:"].includes(url.protocol)) return "Target link must be a valid URL";
    } catch {
      return "Target link must be a valid URL";
    }
  }
  return null;
};

export const listPopupAds = async (req, res) => {
  const popups = await PopupAd.find({}).sort({ createdAt: -1 }).lean();
  return res.json({ popups: (popups ?? []).map(toPopupResponse) });
};

export const createPopupAd = async (req, res) => {
  const payload = normalizePopupPayload(req.body);
  const error = validatePopupPayload(payload);
  if (error) return res.status(400).json({ message: error });

  if (payload.isActive) {
    await PopupAd.updateMany({}, { isActive: false });
  }

  const popup = await PopupAd.create(payload);
  return res.status(201).json({ popup: toPopupResponse(popup) });
};

export const updatePopupAd = async (req, res) => {
  const payload = normalizePopupPayload(req.body);
  const error = validatePopupPayload(payload);
  if (error) return res.status(400).json({ message: error });

  if (payload.isActive) {
    await PopupAd.updateMany({ _id: { $ne: req.params.id } }, { isActive: false });
  }

  const popup = await PopupAd.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!popup) return res.status(404).json({ message: "Popup ad not found" });
  return res.json({ popup: toPopupResponse(popup) });
};

export const deletePopupAd = async (req, res) => {
  const popup = await PopupAd.findByIdAndDelete(req.params.id);
  if (!popup) return res.status(404).json({ message: "Popup ad not found" });
  return res.json({ message: "Popup ad deleted" });
};

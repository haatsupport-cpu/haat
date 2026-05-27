import mongoose from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { normalizeUploadPath, resolvePublicUrl } from "../utils/publicUrl.js";

const normalizeUnit = (value) => {
  const parsed = String(value ?? "").trim();
  return parsed || "kg";
};

export const transformProduct = (product) => {
  const imagePath = normalizeUploadPath(product.imageUrl);
  const imageUrl = resolvePublicUrl(imagePath);

  return {
    id: product._id.toString(),
    _id: product._id.toString(),
    name: product.name,
    description: product.description ?? "",
    price: product.price,
    stock: product.stock,
    unit: normalizeUnit(product.unit),
    tag: product.tag ?? "",
    category: product.category?.name ?? product.category?.toString() ?? "Uncategorized",
    category_id: product.category?._id?.toString() ?? product.category?.toString() ?? null,
    categoryId: product.category?._id?.toString() ?? product.category?.toString() ?? null,
    categoryName: product.category?.name ?? null,
    vendor_id: product.vendor?.toString() ?? null,
    vendorId: product.vendor?.toString() ?? null,
    image: imagePath || null,
    image_path: imagePath || null,
    image_url: imageUrl || null,
    imageUrl: imageUrl || null,
    is_active: product.isActive,
    isActive: product.isActive,
    created_at: product.createdAt,
    updated_at: product.updatedAt,
  };
};

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const resolveCategoryId = async (rawCategory) => {
  if (!rawCategory) return null;

  const trimmed = String(rawCategory).trim();
  if (!trimmed) return null;

  if (mongoose.Types.ObjectId.isValid(trimmed)) {
    const existing = await Category.findById(trimmed).lean();
    if (existing) return existing._id;
  }

  const normalizedName = trimmed.toLowerCase();
  let category = await Category.findOne({ slug: normalizedName }).lean();
  if (!category) {
    category = await Category.findOne({ name: new RegExp(`^${trimmed}$`, "i") }).lean();
  }

  if (category) return category._id;

  const slug = trimmed.replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "").toLowerCase();
  const newCategory = await Category.create({ name: trimmed, slug, imageUrl: "", isActive: true });
  return newCategory._id;
};

export const listProducts = async () => {
  const products = await Product.find({ isActive: true })
    .populate("category", "name")
    .populate("vendor", "name")
    .sort({ createdAt: -1 })
    .lean();

  return products.map(transformProduct);
};

export const getProductRecord = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(400, "Invalid product id");
  }

  const product = await Product.findOne({ _id: id, isActive: true })
    .populate("category", "name")
    .populate("vendor", "name")
    .lean();

  if (!product) throw createHttpError(404, "Product not found");
  return transformProduct(product);
};

export const createProductRecord = async (payload, actor) => {
  if (!actor) throw createHttpError(401, "Unauthorized");

  const {
    name,
    category_id,
    category,
    price,
    stock,
    image_url,
    description,
    is_active,
    vendor_id,
    unit,
    tag,
  } = payload;

  const resolvedCategoryId = await resolveCategoryId(category_id || category);
  if (!resolvedCategoryId) {
    throw createHttpError(400, "Valid category_id or category name is required");
  }

  const ownerId = actor.role === "admin" ? vendor_id ?? actor.id : actor.id;
  if (actor.role === "vendor" && vendor_id && vendor_id !== actor.id) {
    throw createHttpError(403, "Forbidden");
  }

  const product = await Product.create({
    name: name.trim(),
    description: description ?? "",
    price: Number(price),
    stock: Number(stock ?? 0),
    category: resolvedCategoryId,
    vendor: ownerId,
    imageUrl: normalizeUploadPath(image_url),
    unit: normalizeUnit(unit),
    tag: tag ?? "",
    isActive: is_active !== undefined ? Boolean(is_active) : true,
  });

  return transformProduct(product);
};

export const updateProductRecord = async (id, payload, actor) => {
  const product = await Product.findById(id);
  if (!product) throw createHttpError(404, "Product not found");

  if (actor.role === "vendor" && product.vendor?.toString() !== actor.id) {
    throw createHttpError(403, "Forbidden");
  }

  if (actor.role !== "admin" && payload.vendor_id && payload.vendor_id !== actor.id) {
    delete payload.vendor_id;
  }

  if (payload.name !== undefined) product.name = payload.name;
  if (payload.description !== undefined) product.description = payload.description;
  if (payload.price !== undefined) product.price = Number(payload.price);
  if (payload.stock !== undefined) product.stock = Number(payload.stock);
  if (payload.category_id !== undefined || payload.category !== undefined) {
    const resolvedCategoryId = await resolveCategoryId(payload.category_id || payload.category);
    if (!resolvedCategoryId) {
      throw createHttpError(400, "Valid category_id or category name is required");
    }
    product.category = resolvedCategoryId;
  }
  if (payload.image_url !== undefined) product.imageUrl = normalizeUploadPath(payload.image_url);
  if (payload.unit !== undefined) product.unit = normalizeUnit(payload.unit);
  if (payload.tag !== undefined) product.tag = payload.tag;
  if (payload.is_active !== undefined) product.isActive = Boolean(payload.is_active);
  if (actor.role === "admin" && payload.vendor_id !== undefined) product.vendor = payload.vendor_id;

  await product.save();
  return transformProduct(product);
};

export const deleteProductRecord = async (id, actor) => {
  const product = await Product.findById(id);
  if (!product) throw createHttpError(404, "Product not found");

  if (actor.role === "vendor" && product.vendor?.toString() !== actor.id) {
    throw createHttpError(403, "Forbidden");
  }

  await product.deleteOne();
  return { message: "Product deleted successfully" };
};

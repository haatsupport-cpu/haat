import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { resolvePublicUrl } from "../utils/publicUrl.js";

const transformCartItems = (items) =>
  items.map((item) => ({
    id: item.product?._id?.toString() ?? item.product?.toString() ?? "",
    productId: item.product?._id?.toString() ?? item.product?.toString() ?? "",
    product_id: item.product?._id?.toString() ?? item.product?.toString() ?? "",
    cartItemId: item._id.toString(),
    name: item.name,
    price: item.unitPrice,
    quantity: item.quantity,
    imageUrl: resolvePublicUrl(item.imageUrl),
    unit: item.unit ?? "kg",
    tag: item.tag ?? "",
    category: item.category?.toString() ?? "",
  }));

const ensureAuthorizedUser = (req, userId) => {
  if (userId && req.user.id !== userId) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }
  return req.user.id;
};

const getActiveCart = async (userId) => {
  return Cart.findOne({ user: userId, isActive: true });
};

const getCartInternal = async (cart) => {
  if (!cart) return [];
  await cart.populate("items.product");
  return transformCartItems(cart.items);
};

export const getCart = async (req, res) => {
  try {
    const userId = req.query.userId ?? req.user.id;
    ensureAuthorizedUser(req, userId);

    const cart = await getActiveCart(userId);
    const items = await getCartInternal(cart);
    return res.json({ items });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message, details: err.details });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.body.userId ?? req.user.id;
    ensureAuthorizedUser(req, userId);

    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const product = await Product.findById(productId).lean();
    if (!product || product.isActive === false) {
      return res.status(404).json({ message: "Product not found" });
    }

    const qty = Number(quantity) > 0 ? Number(quantity) : 1;

    let cart = await getActiveCart(userId);
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    const existingItem = cart.items.find((item) => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += qty;
      existingItem.unitPrice = product.price;
      existingItem.unit = product.unit ?? "kg";
      existingItem.name = product.name;
      existingItem.imageUrl = product.imageUrl ?? "";
      existingItem.category = product.category;
      existingItem.tag = product.tag;
    } else {
      cart.items.push({
        product: product._id,
        quantity: qty,
        unitPrice: product.price,
        unit: product.unit ?? "kg",
        name: product.name,
        imageUrl: product.imageUrl ?? "",
        category: product.category,
        tag: product.tag ?? "",
      });
    }

    await cart.save();
    const items = await getCartInternal(cart);
    return res.json({ items });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message, details: err.details });
  }
};

export const updateCartItemQuantityById = async (req, res) => {
  try {
    const userId = req.body.userId ?? req.user.id;
    ensureAuthorizedUser(req, userId);

    const { id } = req.params;
    const qty = Number(req.body.quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const cart = await getActiveCart(userId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(id);
    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    item.quantity = qty;
    await cart.save();

    const items = await getCartInternal(cart);
    return res.json({ items });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message, details: err.details });
  }
};

export const updateCartItemQuantityByProduct = async (req, res) => {
  try {
    const userId = req.body.userId ?? req.user.id;
    ensureAuthorizedUser(req, userId);

    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const cart = await getActiveCart(userId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((cartItem) => cartItem.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    item.quantity = qty;
    await cart.save();

    const items = await getCartInternal(cart);
    return res.json({ items });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message, details: err.details });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const userId = req.query.userId ?? req.user.id;
    ensureAuthorizedUser(req, userId);

    const { id } = req.params;
    const cart = await getActiveCart(userId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (cart.items.id(id)) {
      cart.items.pull(id);
    } else {
      const productItem = cart.items.find((cartItem) => cartItem.product.toString() === id);
      if (productItem) {
        cart.items.pull(productItem._id);
      }
    }

    await cart.save();
    const items = await getCartInternal(cart);
    return res.json({ items });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message, details: err.details });
  }
};

export const removeCartItemByProduct = async (req, res) => {
  try {
    const userId = req.params.userId ?? req.user.id;
    ensureAuthorizedUser(req, userId);

    const { productId } = req.params;
    const cart = await getActiveCart(userId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();

    const items = await getCartInternal(cart);
    return res.json({ items });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ message: err.message, details: err.details });
  }
};
